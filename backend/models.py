"""
Database models - Schema design for the blog editor.

Design Decisions:
- We store Lexical's JSON state (not HTML) to preserve full editor state on reload.
  Lexical outputs structured JSON that can be serialized/deserialized without data loss.
  HTML would lose custom nodes, decorators, and metadata.
- Status enum: draft vs published for workflow management.
- Timestamps for audit trail and ordering.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), default="Untitled", nullable=False)
    # Store Lexical's JSON state - preserves nodes, formatting, structure
    content = Column(Text, nullable=True)  # JSON string from Lexical
    status = Column(Enum(PostStatus), default=PostStatus.DRAFT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional for demo

    author = relationship("User", back_populates="posts")
