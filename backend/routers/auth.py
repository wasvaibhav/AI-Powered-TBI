import os
import logging
import secrets
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone, timezone as tz
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

from models import User, SignupRequest, LoginRequest, UserResponse, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetToken
from auth_utils import get_password_hash, verify_password, create_access_token, get_current_user
from routers.rate_limit import limiter

logger = logging.getLogger("agri-allied-backend")

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# ── Google OAuth Setup ──────────────────────────────────────────────────────
_config = Config(environ={
    "GOOGLE_CLIENT_ID":     os.getenv("GOOGLE_CLIENT_ID", ""),
    "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET", ""),
})

oauth = OAuth(_config)
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
# SERVER_URL is the base URL of this backend as seen from the internet/browser.
# Must match the Authorized Redirect URI registered in Google Cloud Console.
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:5000")

# ── Standard Auth Endpoints ─────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/15minutes")
async def signup(request: Request, payload: SignupRequest):
    """
    Register a new supervisor account.
    Rate-limited to 5 requests per 15 minutes per IP.
    """
    # Check for duplicate email
    existing_user = await User.find_one(User.email == payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_pwd = get_password_hash(payload.password)

    # Create and save user
    new_user = User(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        hashed_password=hashed_pwd,
        provider="local",
    )
    await new_user.insert()

    # Issue access token
    token = create_access_token(data={"sub": str(new_user.id)})

    return TokenResponse(
        user=UserResponse.from_mongo(new_user),
        token=token
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/15minutes")
async def login(request: Request, payload: LoginRequest):
    """
    Authenticate email and password.
    Rate-limited to 5 requests per 15 minutes per IP.
    Returns an access token on success, or raises 401 Unauthorized.
    """
    # Retrieve user by email
    user = await User.find_one(User.email == payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Block Google-only accounts from password login
    if user.provider == "google" or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google Sign-In. Please log in with Google."
        )

    # Verify password hash
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Issue access token
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        user=UserResponse.from_mongo(user),
        token=token
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    Protected by JWT validation dependency.
    """
    return UserResponse.from_mongo(current_user)


# ── Google OAuth Endpoints ──────────────────────────────────────────────────

@router.get("/google")
async def google_login(request: Request):
    """
    Redirect the browser to Google's OAuth consent screen.
    """
    if not os.getenv("GOOGLE_CLIENT_ID") or not os.getenv("GOOGLE_CLIENT_SECRET"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env."
        )
    # Use an explicit redirect_uri built from SERVER_URL to avoid
    # request.url_for() generating 127.0.0.1 vs localhost mismatches with
    # the URI registered in Google Cloud Console.
    redirect_uri = f"{SERVER_URL}/api/auth/google/callback"
    logger.info(f"Google OAuth: redirecting with redirect_uri={redirect_uri}")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request):
    """
    Handle the OAuth callback from Google.
    Finds or creates the user in MongoDB, issues our own JWT,
    and redirects to the frontend with the token.
    """
    try:
        google_token = await oauth.google.authorize_access_token(request)
    except Exception as exc:
        logger.warning(f"Google OAuth token exchange failed: {exc}")
        logger.warning(f"  Query params: {dict(request.query_params)}")
        logger.warning(f"  Session keys: {list(request.session.keys())}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=oauth_failed")

    # Extract user info from the ID token
    user_info = google_token.get("userinfo")
    if not user_info:
        # Fallback: fetch from userinfo endpoint
        user_info = await oauth.google.userinfo(token=google_token)

    google_email: str = user_info.get("email", "").lower()
    google_name: str = user_info.get("name") or google_email.split("@")[0]

    if not google_email:
        logger.error("Google OAuth callback: email missing from user_info")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=oauth_failed")

    # Find or create user in MongoDB
    user = await User.find_one(User.email == google_email)
    if not user:
        user = User(
            name=google_name,
            email=google_email,
            provider="google",
            # hashed_password intentionally left None for OAuth users
        )
        await user.insert()
        logger.info(f"Created new Google OAuth user: {google_email}")
    else:
        logger.info(f"Existing user signed in via Google OAuth: {google_email}")

    # Issue our own JWT
    jwt_token = create_access_token(data={"sub": str(user.id)})

    # Redirect to frontend with token in query param
    return RedirectResponse(url=f"{FRONTEND_URL}/oauth-callback?token={jwt_token}")


# ── Password Reset Endpoints ────────────────────────────────────────────────

def _send_reset_email(to_email: str, reset_url: str) -> bool:
    """
    Attempt to send a password reset email via SMTP.
    Returns True on success, False if SMTP is not configured.
    Logs the reset URL at WARNING level so local dev can still use it.
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    # From must match the authenticated SMTP user to avoid spam filters
    smtp_from = smtp_user or os.getenv("SMTP_FROM")

    logger.warning(f"[PASSWORD RESET] Reset link for {to_email}: {reset_url}")

    if not (smtp_host and smtp_user and smtp_pass):
        # No SMTP configured – only log (safe for local dev)
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Agri-Allied: Password Reset Request"
        msg["From"] = smtp_from
        msg["To"] = to_email
        msg["Reply-To"] = smtp_from
        msg["X-Mailer"] = "Agri-Allied Mailer"

        # Plain-text part — critical for avoiding spam filters
        plain_body = (
            f"Password Reset Request - Agri-Allied\n\n"
            f"We received a request to reset the password for your Agri-Allied supervisor account.\n\n"
            f"Click or copy the link below to set a new password (expires in 30 minutes):\n\n"
            f"{reset_url}\n\n"
            f"If you did not request this, ignore this email — your password will remain unchanged.\n\n"
            f"Agri-Allied — Almora Organic Collective"
        )

        html_body = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:6px;overflow:hidden;max-width:520px;">
        <tr>
          <td style="background:#2D5016;padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">Agri-Allied</p>
            <p style="margin:4px 0 0;color:#c8e6a0;font-size:12px;">Almora Organic Collective</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#2D5016;font-size:22px;">Password Reset Request</h2>
            <p style="margin:0 0 12px;color:#444;line-height:1.6;">
              We received a request to reset the password for your supervisor account.
            </p>
            <p style="margin:0 0 24px;color:#444;line-height:1.6;">
              Click the button below to choose a new password. This link expires in
              <strong>30 minutes</strong>.
            </p>
            <a href="{reset_url}"
               style="display:inline-block;padding:14px 28px;background:#2D5016;color:#ffffff;
                      font-size:15px;font-weight:bold;text-decoration:none;border-radius:4px;">
              Reset My Password
            </a>
            <p style="margin:28px 0 0;color:#888;font-size:13px;line-height:1.5;">
              If you didn't request a password reset, you can safely ignore this email.
              Your password will remain unchanged.
            </p>
            <p style="margin:12px 0 0;color:#aaa;font-size:11px;">
              Or copy this link into your browser:<br>
              <span style="color:#555;word-break:break-all;">{reset_url}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;">
            <p style="margin:0;color:#bbb;font-size:11px;">
              Agri-Allied &mdash; Almora Organic Collective &bull; This is an automated message.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

        # Attach plain-text first, HTML second (RFC 2046 — clients prefer last part)
        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_from, [to_email], msg.as_string())

        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as exc:
        logger.error(f"Failed to send reset email to {to_email}: {exc}")
        return False


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")  # TODO: change back to "3/15minutes" before production
async def forgot_password(request: Request, payload: ForgotPasswordRequest):
    """
    Request a password reset link.
    Always returns 200 to prevent email enumeration.
    Rate-limited to 3 requests per 15 minutes per IP.
    """
    user = await User.find_one(User.email == payload.email)

    if user and user.provider == "local" and user.hashed_password:
        # Generate a cryptographically-secure random token
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        logger.warning(f"[FORGOT-PWD] New token_hash prefix: {token_hash[:16]}")

        # Mark any existing unused tokens for this email as used
        # Using Beanie native find() with raw dict filter
        await PasswordResetToken.find({"email": payload.email, "used": False}).update(
            {"$set": {"used": True}}
        )

        # Persist new token — store expires_at as naive UTC for consistency
        reset_token = PasswordResetToken(
            email=payload.email,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=30),
        )
        await reset_token.insert()
        logger.warning(f"[FORGOT-PWD] Token inserted for {payload.email}")

        reset_url = f"{FRONTEND_URL}/reset-password?token={raw_token}"
        _send_reset_email(payload.email, reset_url)

    # Always respond 200 so attackers cannot enumerate registered emails
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(payload: ResetPasswordRequest):
    """
    Complete a password reset using the token from the email link.
    """
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    logger.warning(f"[RESET-PWD] Looking up token_hash prefix: {token_hash[:16]}")

    # Use Beanie native find_one with raw dict filter — works reliably in Beanie 2.x
    reset_record = await PasswordResetToken.find_one({"token_hash": token_hash, "used": False})
    logger.warning(f"[RESET-PWD] Record found: {reset_record is not None}")

    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )

    # Compare expiry (both stored as naive UTC datetimes)
    expires_at = reset_record.expires_at
    if expires_at.tzinfo is not None:
        expires_at = expires_at.replace(tzinfo=None)
    if datetime.utcnow() > expires_at:
        await reset_record.set({"used": True})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )

    user = await User.find_one(User.email == reset_record.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    # Update password and mark token as used
    new_hash = get_password_hash(payload.new_password)
    await user.set({"hashed_password": new_hash})
    await reset_record.set({"used": True})

    logger.info(f"Password successfully reset for {user.email}")
    return {"message": "Password reset successfully. You can now log in."}
