"""Smart Blog Editor - FastAPI Backend."""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, get_db
from routers import posts, auth, ai

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Blog Editor API",
    description="Notion-style block editor with AI capabilities",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://small-blog-editor.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts.router)
app.include_router(auth.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"message": "Smart Blog Editor API", "docs": "/docs"}
