"""Pydantic schemas for API request/response validation."""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Post schemas
class PostCreate(BaseModel):
    title: Optional[str] = "Untitled"
    content: Optional[str] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# AI schemas
class AIGenerateRequest(BaseModel):
    text: str
    action: str  # "summary" | "fix_grammar" | "expand"
