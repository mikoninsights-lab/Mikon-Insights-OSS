# Mikon OSS — Test Credentials

## Admin account (seeded)
- **Email**: `admin@mikon.com`
- **Password**: `admin123`
- **Role**: Admin

Login endpoint: `POST /api/auth/login`
Frontend login page: `/login`

## Third-party API keys in backend/.env
- `GEMINI_API_KEY`: user-provided Google Gemini API key (do NOT expose to frontend).
  Used by `POST /api/ghostwriter/generate` via `@google/generative-ai` SDK.
  Active models with this key:
    - `gemini-flash-lite-latest` (primary, Flash)
    - `gemini-2.5-flash-lite` (fallback)
  Rate-limited/unavailable models on this plan: `gemini-2.5-pro`, `gemini-3-pro-preview` (429), `gemini-2.5-flash` (503 frequent).
