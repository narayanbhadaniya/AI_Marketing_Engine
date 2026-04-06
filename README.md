# AI Marketing Intelligence & Content Engine

AI-powered marketing workspace — white, blue & black UI with horizontal top navigation.

## Quick Start

### 1. Get Gemini API Key (free)
https://makersuite.google.com/app/apikey

### 2. Backend
```bash
cd backend
cp .env.example .env        # add your GEMINI_API_KEY
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### 3. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open: http://localhost:5173

## Tech Stack
- Frontend: React 18 + Vite + TailwindCSS + Recharts
- Backend: FastAPI + SQLite + SQLAlchemy
- AI: Google Gemini 1.5 Pro + Flash

## Modules
1. Brand & Campaign Setup — AI validates tone/platform fit
2. Content Hub — 8 formats from one brief
3. Repurpose Engine — Blog/podcast → all formats
4. Ad Copy A/B — 5 variants, side-by-side comparison
5. Sentiment AI — CSV upload, word cloud, VoC summary
6. Content Calendar — Drag-and-drop scheduling
7. Competitor Analysis (Bonus) — Counter strategy + tone score

## Deploy
- Backend: Render.com (set GEMINI_API_KEY env var)
- Frontend: Vercel (set VITE_API_URL to your Render URL)
# AI_Marketing_Engine
