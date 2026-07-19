import re
from datetime import datetime
from typing import Literal, Optional, List
from beanie import Document, Indexed
from pydantic import BaseModel, Field, EmailStr, field_validator

# ==================== BEANIE DOCUMENT SCHEMAS ====================

class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)
    phone: Optional[str] = None
    hashed_password: Optional[str] = None  # None for OAuth users
    provider: str = "local"  # "local" | "google"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class Advisory(Document):
    userId: str  # Owner's user ID string
    query: str
    crop: str
    advice: str
    status: Literal["open", "resolved"] = "open"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "advisories"


class ChatMessage(Document):
    userId: str  # Owner's user ID string
    role: Literal["user", "assistant"]
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chat_messages"


class PasswordResetToken(Document):
    """Stores a hashed password-reset token tied to a user email."""
    email: str
    token_hash: str  # sha256 of the raw token sent to the user
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "password_reset_tokens"


# ==================== PYDANTIC TRANSFER SCHEMAS ====================

class AdvisoryCreate(BaseModel):
    """Request body for creating a new advisory."""
    crop: str = Field(..., min_length=1, description="Crop name")
    query: str = Field(..., min_length=1, description="Field observation or question")
    advice: str = Field(..., min_length=1, description="Advisory recommendation text")
    status: Literal["open", "resolved"] = "open"


class AdvisoryUpdate(BaseModel):
    """Request body for partially updating an advisory (all fields optional)."""
    crop: Optional[str] = None
    query: Optional[str] = None
    advice: Optional[str] = None
    status: Optional[Literal["open", "resolved"]] = None


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Supervisor's full name")
    email: EmailStr = Field(..., description="Unique email address")
    phone: str = Field(..., min_length=10, description="Phone number")
    password: str = Field(
        ...,
        min_length=8,
        description="Password — min 8 characters, must contain at least one letter and one number"
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Login email")
    password: str = Field(..., description="Account password")


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    createdAt: datetime

    @classmethod
    def from_mongo(cls, user: User) -> "UserResponse":
        return cls(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone,
            createdAt=user.created_at
        )


class AdvisoryResponse(BaseModel):
    id: str
    userId: str
    query: str
    crop: str
    advice: str
    status: Literal["open", "resolved"]
    createdAt: datetime

    @classmethod
    def from_mongo(cls, adv: Advisory) -> "AdvisoryResponse":
        return cls(
            id=str(adv.id),
            userId=adv.userId,
            query=adv.query,
            crop=adv.crop,
            advice=adv.advice,
            status=adv.status,
            createdAt=adv.createdAt
        )


class ChatMessageResponse(BaseModel):
    id: str
    userId: str
    role: Literal["user", "assistant"]
    content: str
    createdAt: datetime

    @classmethod
    def from_mongo(cls, msg: ChatMessage) -> "ChatMessageResponse":
        return cls(
            id=str(msg.id),
            userId=msg.userId,
            role=msg.role,
            content=msg.content,
            createdAt=msg.createdAt
        )


class TokenResponse(BaseModel):
    user: UserResponse
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address to send reset link to")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Reset token from email")
    new_password: str = Field(
        ...,
        min_length=8,
        description="New password — min 8 characters, must contain at least one letter and one number"
    )

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        return v
