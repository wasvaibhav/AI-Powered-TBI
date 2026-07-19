# Agri-Allied — API Documentation

Complete reference for all backend endpoints.
**Base URL (local):** `http://localhost:5000`
**Auth scheme:** JWT Bearer token — send `Authorization: Bearer <token>` on all 🔒 protected routes.
**Interactive docs:** FastAPI auto-generates Swagger UI at `http://localhost:5000/docs`.

---

## Quick Reference

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|:----:|---------|
| 1 | POST | `/api/auth/signup` | — | Register a supervisor account |
| 2 | POST | `/api/auth/login` | — | Login with email + password |
| 3 | GET | `/api/auth/me` | 🔒 | Current user profile |
| 4 | GET | `/api/auth/google` | — | Start Google OAuth flow |
| 5 | GET | `/api/auth/google/callback` | — | OAuth callback (browser only) |
| 6 | POST | `/api/auth/forgot-password` | — | Request password-reset link |
| 7 | POST | `/api/auth/reset-password` | — | Set new password with token |
| 8 | GET | `/api/advisories` | 🔒 | List my advisories |
| 9 | GET | `/api/advisories/search?q=` | 🔒 | Search my advisories |
| 10 | GET | `/api/advisories/filter?status=` | 🔒 | Filter by open/resolved |
| 11 | GET | `/api/advisories/{id}` | 🔒 | Get one advisory |
| 12 | POST | `/api/advisories` | 🔒 | Create advisory |
| 13 | PUT | `/api/advisories/{id}` | 🔒 | Update advisory (partial) |
| 14 | DELETE | `/api/advisories/{id}` | 🔒 | Delete advisory |
| 15 | POST | `/api/ai/advisory` | 🔒 | AI advisory chat (Gemini) |
| 16 | POST | `/api/chat` | 🔒 | Alias of #15 |
| 17 | GET | `/api/chat/history` | 🔒 | My chat history |
| 18 | GET | `/api/health` | — | Server health check |

---

## 1. Authentication

### 1.1 `POST /api/auth/signup`

Register a new supervisor account. **Rate-limited: 5 requests / 15 min / IP.**

**Request body**
```json
{
  "name": "Vaibhav Singh Kaira",
  "email": "vaibhav@agriallied.org",
  "phone": "9876543210",
  "password": "Testpass1"
}
```

**Validation rules**
- `email` — must be a valid email format (unique)
- `phone` — min 10 characters
- `password` — min 8 characters, at least one letter **and** one number

**Success — `201 Created`**
```json
{
  "user": {
    "id": "665f1c2ab53e2c9d88f01a11",
    "name": "Vaibhav Singh Kaira",
    "email": "vaibhav@agriallied.org",
    "phone": "9876543210",
    "createdAt": "2026-07-18T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**
| Code | When |
|------|------|
| 400 | `Email already registered` |
| 400 | Validation failure (bad email / weak password / short phone) |
| 429 | Rate limit exceeded |

---

### 1.2 `POST /api/auth/login`

Authenticate with email + password. **Rate-limited: 5 requests / 15 min / IP.**

**Request body**
```json
{ "email": "vaibhav@agriallied.org", "password": "Testpass1" }
```

**Success — `200 OK`** — same shape as signup (`user` + `token`). Token expires in 24 hours.

**Errors**
| Code | When |
|------|------|
| 401 | `Invalid credentials` (wrong email **or** password — same message to prevent enumeration) |
| 400 | Account was created via Google — must use Google Sign-In |
| 429 | Rate limit exceeded |

---

### 1.3 `GET /api/auth/me` 🔒

Returns the authenticated user's profile. Used by the frontend on page load to restore the session.

**Success — `200 OK`**
```json
{
  "id": "665f1c2ab53e2c9d88f01a11",
  "name": "Vaibhav Singh Kaira",
  "email": "vaibhav@agriallied.org",
  "phone": "9876543210",
  "createdAt": "2026-07-18T10:30:00.000Z"
}
```

**Errors:** `401` if token is missing, invalid, expired, or the user no longer exists.

---

### 1.4 `GET /api/auth/google`

Browser-navigation endpoint (not called via fetch). Redirects to Google's OAuth consent screen.
Frontend triggers it with `window.location.href = "<backend>/api/auth/google"`.

**Errors:** `503` if `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not configured.

### 1.5 `GET /api/auth/google/callback`

Handled automatically by Google's redirect — never called directly.
Finds-or-creates the user (`provider: "google"`, no password stored), issues our JWT, then redirects the browser to:
`{FRONTEND_URL}/oauth-callback?token=<jwt>` — or `{FRONTEND_URL}/login?error=oauth_failed` on failure.

---

### 1.6 `POST /api/auth/forgot-password`

Request a password-reset link. **Always returns `200`** regardless of whether the email exists (prevents account enumeration). Rate-limited.

**Request body**
```json
{ "email": "vaibhav@agriallied.org" }
```

**Success — `200 OK`**
```json
{ "message": "If that email is registered, a reset link has been sent." }
```

**Behavior**
- Generates a cryptographically secure token, stores only its **SHA-256 hash** in the `password_reset_tokens` collection, valid for **30 minutes**, single-use.
- Requesting a new link **invalidates all previous unused links** for that email.
- If SMTP is configured (`SMTP_HOST/USER/PASS`), the link is emailed; otherwise it is logged to the server console (dev mode).

### 1.7 `POST /api/auth/reset-password`

Complete the reset using the token from the emailed link.

**Request body**
```json
{ "token": "hayIYSRa-x9XkpPyo-...", "new_password": "Newpass123" }
```

**Success — `200 OK`**
```json
{ "message": "Password reset successfully. You can now log in." }
```

**Errors**
| Code | When |
|------|------|
| 400 | `Invalid or expired reset token.` (wrong, already-used, or superseded token) |
| 400 | `Reset token has expired.` (older than 30 min — token is consumed) |
| 400 | New password fails strength validation |
| 404 | User account no longer exists |

---

## 2. Crop Advisories (CRUD) — all 🔒

All advisory routes are **owner-scoped**: every query is filtered by the user ID decoded from the JWT. One user can never read, update, or delete another user's records (they receive `404`, indistinguishable from "not found").

**Advisory object**
```json
{
  "id": "665f1d99b53e2c9d88f01b22",
  "userId": "665f1c2ab53e2c9d88f01a11",
  "crop": "Mandua (Finger Millet)",
  "query": "White mold patches during storage",
  "advice": "Sun-dry grains below 10-12% moisture; store in airtight bins...",
  "status": "open",
  "createdAt": "2026-07-18T11:00:00.000Z"
}
```

### 2.1 `GET /api/advisories`
List all my advisories, newest first. **`200`** → array (may be empty).

### 2.2 `GET /api/advisories/search?q=<text>`
Case-insensitive text search across `crop`, `query`, and `advice`. Empty `q` returns everything. User input is regex-escaped (safe against regex injection). **`200`** → array.

### 2.3 `GET /api/advisories/filter?status=<open|resolved>`
Filter by status. Any other value → **`400`** validation error. **`200`** → array.

### 2.4 `GET /api/advisories/{id}`
Get one advisory. **`404`** if the ID is malformed, doesn't exist, or belongs to another user.

### 2.5 `POST /api/advisories`
**Request body** (all required, `status` optional, defaults `"open"`):
```json
{ "crop": "Apple", "query": "Codling moth in orchard", "advice": "Pheromone traps 10-12/acre...", "status": "open" }
```
**`201 Created`** → the created advisory object.

### 2.6 `PUT /api/advisories/{id}`
Partial update — send only the fields you want to change:
```json
{ "status": "resolved" }
```
**`200`** → updated object. **`400`** if the body is empty. **`404`** as in 2.4.

### 2.7 `DELETE /api/advisories/{id}`
**`204 No Content`** on success (empty body). **`404`** as in 2.4.

---

## 3. AI Advisory Chat (Google Gemini) — 🔒

### 3.1 `POST /api/ai/advisory` (canonical) / `POST /api/chat` (alias)

Sends the conversation to **Gemini `gemini-2.5-flash`** with a domain-locked system prompt (organic mountain farming, Uttarakhand; declines off-topic questions; always appends an extension-officer disclaimer). Both the user question and the AI reply are persisted to `chat_messages`.

**Request body** — the **full conversation history**, last item being the new question:
```json
{
  "messages": [
    { "role": "user", "content": "My Rajma leaves have brown circular spots. What should I do?" },
    { "role": "assistant", "content": "This indicates Anthracnose..." },
    { "role": "user", "content": "Is copper spray safe during flowering?" }
  ]
}
```

**Success — `200 OK`**
```json
{ "reply": "Copper-based sprays should be avoided during peak flowering..." }
```

**Errors**
| Code | When |
|------|------|
| 400 | `messages` array is empty |
| 401 | Missing/invalid JWT |
| 500 | `GEMINI_API_KEY` not configured, or Gemini API/network failure (real error logged server-side, clean message returned) |

**Generation settings:** temperature `0.4`, maxOutputTokens `1200`, request timeout `45s`.

### 3.2 `GET /api/chat/history`

Returns the authenticated user's full chat log, oldest-first, so the frontend can restore the conversation on page load.

**Success — `200 OK`**
```json
[
  { "id": "...", "userId": "...", "role": "user", "content": "My Rajma leaves...", "createdAt": "..." },
  { "id": "...", "userId": "...", "role": "assistant", "content": "This indicates...", "createdAt": "..." }
]
```

---

## 4. System

### 4.1 `GET /api/health`
```json
{ "status": "healthy", "api_key_configured": true }
```
Public. Confirms the server is running and whether the Gemini key is loaded.

---

## 5. Error Format (all endpoints)

Every error returns a consistent JSON body:
```json
{ "detail": "Human-readable message" }
```

| Code | Meaning |
|------|---------|
| 400 | Validation failure / bad request / duplicate email / bad reset token |
| 401 | Missing, invalid, or expired JWT; wrong login credentials |
| 404 | Record not found or not owned by you |
| 429 | Rate limit exceeded (auth endpoints) |
| 500 | Unexpected server error (details logged, never leaked) |
| 503 | Optional service (Google OAuth) not configured |

## 6. Security Summary

- Passwords: bcrypt-hashed (`passlib`), never stored or returned in plain text
- Sessions: JWT (HS256, `python-jose`), 24-hour expiry, secret in `.env`
- Reset tokens: SHA-256-hashed at rest, 30-min expiry, single-use
- Rate limiting: `slowapi`, 5 req / 15 min / IP on signup & login
- Input validation: Pydantic (`EmailStr`, password strength, status literals)
- Data isolation: every advisory/chat query is scoped to the JWT's user ID
- CORS: restricted to the configured frontend origins
