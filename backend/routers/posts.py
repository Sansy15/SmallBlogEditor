"""RESTful API for blog posts."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Post, PostStatus, User
from schemas import PostCreate, PostUpdate, PostResponse
from auth import get_current_user_optional

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.post("/", response_model=PostResponse)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    """Create a new draft post."""
    post = Post(
        title=data.title or "Untitled",
        content=data.content,
        status=PostStatus.DRAFT,
        user_id=user.id if user else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/", response_model=list[PostResponse])
def list_posts(
    db: Session = Depends(get_db),
    status_filter: str | None = None,
):
    """List all posts, optionally filtered by status."""
    q = db.query(Post)
    if status_filter:
        try:
            q = q.filter(Post.status == PostStatus(status_filter))
        except ValueError:
            pass
    return q.order_by(Post.updated_at.desc()).all()


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    data: PostUpdate,
    db: Session = Depends(get_db),
):
    """Update post content (Auto-save hits this endpoint)."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if data.title is not None:
        post.title = data.title
    if data.content is not None:
        post.content = data.content
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/publish", response_model=PostResponse)
def publish_post(post_id: int, db: Session = Depends(get_db)):
    """Change status to published."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.status = PostStatus.PUBLISHED
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"ok": True}
