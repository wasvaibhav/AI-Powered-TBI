from fastapi import APIRouter, Depends, HTTPException, status
from models import User, SignupRequest, LoginRequest, UserResponse, TokenResponse
from auth_utils import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    """
    Register a new supervisor account.
    Validates input format and checks if email is already taken.
    """
    # Check if user already exists
    existing_user = await User.find_one(User.email == payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Hash the password
    hashed_pwd = get_password_hash(payload.password)

    # Create and save user
    new_user = User(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        hashed_password=hashed_pwd
    )
    await new_user.insert()

    # Create access token
    token = create_access_token(data={"sub": str(new_user.id)})

    return TokenResponse(
        user=UserResponse.from_mongo(new_user),
        token=token
    )

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Authenticate email and password.
    Returns a access token on success, or raises 401 Unauthorized.
    """
    # Retrieve user by email
    user = await User.find_one(User.email == payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Verify password hash
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Create access token
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
