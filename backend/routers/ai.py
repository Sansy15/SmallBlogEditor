"""AI endpoints - Generate Summary, Fix Grammar using free LLM API (Gemini)."""
import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import httpx

from schemas import AIGenerateRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Use Gemini API (free tier) - set GEMINI_API_KEY in .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def _get_prompt(text: str, action: str) -> str:
    if action == "summary":
        return f"Summarize the following text concisely in 2-4 sentences. Keep the same language as the original:\n\n{text}"
    if action == "fix_grammar":
        return f"Fix any grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text, no explanation:\n\n{text}"
    if action == "expand":
        return f"Expand the following text into a longer, more detailed version. Keep the same tone:\n\n{text}"
    raise HTTPException(status_code=400, detail="Invalid action. Use: summary, fix_grammar, expand")


@router.post("/generate")
async def generate_ai(data: AIGenerateRequest):
    """
    Send text to Gemini API and stream response.
    Actions: summary, fix_grammar, expand
    """
    if not GEMINI_API_KEY:
        # Fallback: return mock response for demo without API key
        return {
            "result": "[Set GEMINI_API_KEY to enable AI] " + data.text[:100] + "...",
            "streaming": False,
        }

    prompt = _get_prompt(data.text, data.action)

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Use Gemini 3 Flash Preview model (matches AI Studio playground selection).
        url = (
            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/gemini-3-flash-preview:generateContent?key={GEMINI_API_KEY}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1024},
        }
        try:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            body = resp.json()
            candidates = body.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=500, detail="No response from AI")
            parts = candidates[0].get("content", {}).get("parts", [])
            text = parts[0].get("text", "") if parts else ""
            return {"result": text.strip(), "streaming": False}
        except httpx.HTTPStatusError as e:
            # If the specific Gemini model or API version isn't available for this key,
            # fall back to a mock response instead of surfacing a 404 to the client.
            if e.response.status_code == 404:
                return {
                    "result": "[AI model not available for this key right now] "
                    + data.text[:100]
                    + "...",
                    "streaming": False,
                }
            raise HTTPException(status_code=e.response.status_code, detail=str(e.response.text))


@router.post("/generate/stream")
async def generate_ai_stream(data: AIGenerateRequest):
    """Stream AI response for better UX (uses generateContent with stream)."""
    if not GEMINI_API_KEY:
        async def mock_stream():
            yield f"data: {json.dumps({'text': '[Set GEMINI_API_KEY to enable streaming]'})}\n\n"
        return StreamingResponse(
            mock_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    prompt = _get_prompt(data.text, data.action)
    url = (
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/gemini-3-flash-preview:streamGenerateContent?key={GEMINI_API_KEY}&alt=sse"
    )

    async def stream():
        async with httpx.AsyncClient(timeout=60.0) as client:
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1024},
            }
            async with client.stream("POST", url, json=payload) as resp:
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        yield line + "\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
