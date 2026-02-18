# Smart Blog Editor

A Notion-style block editor with AI capabilities and robust state management. Built for a full-stack intern assignment.

## Features

- **Rich Text Editor (Lexical):** Bold, Italic, Headings (H1–H3), Bullet/Numbered lists
- **Auto-Save:** Debounced saves 2 seconds after you stop typing
- **AI Integration:** "Generate Summary" and "Fix Grammar" (Gemini API)
- **JWT Auth:** Login/Signup (optional)
- **Clean UI:** Tailwind CSS, responsive, Medium/Notion-inspired

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+

### Backend

```bash
cd SmartBlogEditor/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Windows PowerShell (from project root):**
```powershell
cd SmartBlogEditor\backend
.\run.ps1
```

API runs at `http://localhost:8000`. Docs: `http://localhost:8000/docs`

**Troubleshooting:**
- **pydantic-core build fails (Rust/Cargo error):** You're likely on Python 3.14. The requirements use `pydantic>=2.12` which has pre-built wheels for 3.14—ensure pip is up to date: `python -m pip install --upgrade pip`, then retry. If it still fails, use Python 3.11 or 3.12.
- **uvicorn not found:** Run with `python -m uvicorn main:app --reload` instead of `uvicorn main:app --reload`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. API requests are proxied to the backend.

### AI (Optional)

1. Get a [Gemini API key](https://makersuite.google.com/app/apikey)
2. Create `backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Or set the env var before starting the server.

## Auto-Save Logic

We use a **debouncing algorithm** to avoid spamming the API on every keystroke:

1. Each editor change updates the Zustand store with the latest Lexical JSON.
2. A debounced function waits **2 seconds** after the last change.
3. If no new change occurs in that window, it sends a `PATCH` to `/api/posts/{id}`.
4. The debounce is implemented in `useDebounce.ts` without external libraries.

```
User types → onChange → store update → debounce(2000) → PATCH /api/posts/{id}
```

## Database Schema

**Why Lexical JSON instead of HTML?**

- Lexical's JSON preserves the full editor state (nodes, formatting, structure).
- Re-loading JSON restores the editor exactly—no data loss.
- HTML would lose custom blocks, nested lists, and metadata.

**Schema:**
- `posts`: id, title, content (JSON text), status (draft/published), created_at, updated_at, user_id

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/posts/ | Create draft |
| GET | /api/posts/ | List posts |
| GET | /api/posts/{id} | Get post |
| PATCH | /api/posts/{id} | Update (auto-save) |
| POST | /api/posts/{id}/publish | Publish |
| POST | /api/auth/signup | Sign up |
| POST | /api/auth/login | Log in |
| POST | /api/ai/generate | AI: summary / fix_grammar |

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for file structure and design decisions.

## Deployment

- **Backend:** Deploy to Railway, Render, or any Python host. Set `DATABASE_URL` for production DB.
- **Frontend:** `npm run build` → deploy `dist/` to Vercel, Netlify, etc. Set `VITE_API_URL` to your API URL.

## License

MIT
