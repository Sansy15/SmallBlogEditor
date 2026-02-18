"""
Database configuration and session management for SQLite.
We use SQLite for simplicity - no external DB setup required.
For production, swap the connection string to PostgreSQL/MySQL.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./smart_blog.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for FastAPI - provides database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
