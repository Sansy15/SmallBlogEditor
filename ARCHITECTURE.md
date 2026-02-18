# Smart Blog Editor - Architecture Document

## Overview

This document explains the system architecture, file structure, and design decisions for the Smart Blog Editor.

## High-Level Architecture

```
┌─────────────────┐     REST API      ┌─────────────────┐     SQLite      ┌──────────────┐
│  React Frontend │ ◄──────────────►  │  FastAPI        │ ◄─────────────► │  Database    │
│  (Lexical +     │   JSON/HTTP       │  Backend        │                 │  (smart_blog │
│   Zustand)      │                   │                 │                 │   .db)       │
└─────────────────┘                   └─────────────────┘                 └──────────────┘
        │                                      │
        │                                      │ (Optional)
        │                                      ▼
        │                             ┌─────────────────┐
        └────────────────────────────►│  Gemini API     │
              AI requests             │  (Generate/Fix) │
                                      └─────────────────┘
```

## File Structure

```
SmartBlogEditor/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── AIToolbar.tsx # AI actions (Summary, Fix Grammar)
│   │   ├── editor/           # Lexical editor modules
│   │   │   ├── Editor.tsx    # Main editor composition
│   │   │   ├── Toolbar.tsx   # Formatting toolbar (B/I/H1/H2/H3/Lists)
│   │   │   ├── theme.ts      # Lexical theme (Tailwind classes)
│   │   │   └── plugins/
│   │   │       └── OnChangePlugin.tsx  # Syncs editor state → Zustand
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useDebounce.ts    # Debounce algorithm (auto-save)
│   │   │   ├── useAutoSave.ts    # Auto-save orchestration
│   │   │   └── useInitialContent.ts  # Hydrate editor from stored JSON
│   │   ├── lib/
│   │   │   └── api.ts        # API client
│   │   ├── pages/
│   │   │   ├── EditorPage.tsx  # Main editor + sidebar
│   │   │   └── AuthPage.tsx    # Login/Signup (JWT)
│   │   ├── store/            # Zustand stores
│   │   │   ├── useEditorStore.ts  # Posts, current post, editor JSON
│   │   │   └── useAuthStore.ts    # JWT token (persisted)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── database.py          # SQLAlchemy + SQLite
│   ├── models.py            # User, Post models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT utilities
│   └── routers/
│       ├── posts.py         # CRUD, publish
│       ├── auth.py          # Login, signup
│       └── ai.py            # Generate summary, fix grammar
├── ARCHITECTURE.md
└── README.md
```

## Design Decisions

### 1. Lexical JSON vs HTML Storage

**Decision:** Store Lexical's JSON state in the database.

**Why:**
- Lexical's JSON preserves nodes, decorators, metadata, and structure exactly.
- Re-loading JSON allows full fidelity restoration (no data loss).
- HTML would lose custom blocks, list nesting, and formatting metadata.
- Lexical's `editorState.toJSON()` / `parseEditorState(JSON)` round-trips perfectly.

### 2. Database Schema

**Posts table:**
- `id`, `title`, `content` (TEXT/JSON), `status` (draft|published)
- `created_at`, `updated_at` (timestamps)
- `user_id` (optional, for multi-user)

**Why SQLite:**
- Zero setup for local dev and demos.
- Easy to swap to PostgreSQL/MySQL by changing `DATABASE_URL`.

### 3. Auto-Save: Debouncing

**Implementation:** Custom `useDebounce` hook + `useAutoSave` hook.

**Logic:**
- On every editor change, `OnChangePlugin` pushes Lexical JSON to Zustand.
- `useAutoSave` watches `editorJson` and calls a **debounced** save function.
- Save runs only after the user stops typing for **2 seconds** (configurable).
- This avoids API spam on every keystroke while keeping data safe.

**Flow:**
```
Keystroke → Lexical onChange → Zustand setEditorJson → useAutoSave (debounced) → PATCH /api/posts/{id}
```

### 4. State Management (Zustand)

- **useEditorStore:** Posts list, current post, editor JSON, isSaving, lastSavedAt.
- **useAuthStore:** JWT token (persisted in localStorage).
- Clean separation: editor state ↔ API sync.

### 5. Modular React Structure

- **Editor:** Composed from LexicalComposer, RichTextPlugin, Toolbar, OnChangePlugin, HistoryPlugin, ListPlugin.
- **Custom hooks:** useDebounce, useAutoSave, useInitialContent keep logic reusable.
- **Components:** AIToolbar uses Lexical context; pages stay presentational.

### 6. AI Integration

- Uses Gemini API (free tier) for "Generate Summary" and "Fix Grammar".
- Set `GEMINI_API_KEY` in backend env to enable.
- Falls back to mock message when key not set.

### 7. Authentication

- JWT-based signup/login.
- Token stored in localStorage via Zustand persist.
- Posts API supports optional auth (user_id when logged in).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/posts/ | Create draft |
| GET | /api/posts/ | List posts |
| GET | /api/posts/{id} | Get post |
| PATCH | /api/posts/{id} | Update (auto-save) |
| POST | /api/posts/{id}/publish | Publish |
| DELETE | /api/posts/{id} | Delete |
| POST | /api/auth/signup | Sign up |
| POST | /api/auth/login | Log in |
| POST | /api/ai/generate | AI: summary / fix_grammar / expand |

## Tech Stack Summary

- **Frontend:** React, Lexical, Zustand, Tailwind CSS, React Router
- **Backend:** FastAPI, SQLAlchemy, SQLite
- **Auth:** JWT (python-jose, passlib)
- **AI:** Gemini API (optional)
