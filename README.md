# Resume ATS Score Checker

An AI-powered tool that analyzes your resume against a job description and provides an ATS (Applicant Tracking System) compatibility score. Upload a PDF resume, paste a job description, and get instant feedback on how well your resume matches the role — including keyword analysis, detailed feedback, and actionable improvements.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Python 3, FastAPI, Uvicorn             |
| Frontend | React 19, Vite, Framer Motion, Lucide  |
| AI/LLM   | Groq (`llama-3.3-70b-versatile`)       |
| PDF      | PyPDF2                                  |

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Groq API Key** ([Get one here](https://console.groq.com/keys))

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API starts at `http://localhost:8001`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint          | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/`               | Health check                             |
| POST   | `/upload-resume`  | Upload a PDF resume, returns extracted text |
| POST   | `/analyze`        | Send resume text + JD, returns ATS analysis |

### POST `/upload-resume`

**Request:** `multipart/form-data` with field `file` (PDF)

**Response:**
```json
{
  "success": true,
  "filename": "resume.pdf",
  "resume_text": "Extracted text content...",
  "characters": 2450,
  "preview": "First 300 characters..."
}
```

### POST `/analyze`

**Request:**
```json
{
  "resume_text": "Full extracted resume text...",
  "jd_text": "Full job description text...",
  "api_key": "gsk_your_groq_api_key",
  "provider": "groq"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "scores": {
      "overall": { "score": 7.5, "label": "Overall Result" },
      "effectivity": { "score": 8.0, "label": "Effectivity" },
      "layout_design": { "score": 6.0, "label": "Layout & Design" },
      "content_relevance": { "score": 7.0, "label": "Content Relevance" },
      "grammar_syntax": { "score": 9.0, "label": "Grammar & Syntax" },
      "impact": { "score": 6.5, "label": "Impact" }
    },
    "keyword_analysis": {
      "matched_keywords": ["Python", "FastAPI", "React"],
      "missing_keywords": ["Docker", "Kubernetes"],
      "match_percentage": 60
    },
    "detailed_feedback": {
      "strengths": ["✅ Strong technical skills section", "✅ Good action verbs"],
      "improvements": ["🙈 Missing key JD keywords", "🙈 Add professional summary"]
    },
    "ats_readability_score": 75,
    "summary": "The resume demonstrates solid technical experience but could better align with job description keywords."
  }
}
```

---

## Project Structure

```
Project29_ResumeATSChecker/
├── README.md
├── prompt.md                          # All prompts used in the project
├── screenshots/                       # Application screenshots
│   └── app-screenshot.png
├── backend/
│   ├── main.py                        # FastAPI entry point (port 8001)
│   ├── requirements.txt               # Python dependencies
│   ├── services/
│   │   ├── __init__.py
│   │   ├── file_parser.py             # PDF text extraction (PyPDF2)
│   │   └── ats_service.py             # Groq LLM integration & ATS prompt
│   └── routers/
│       ├── __init__.py
│       ├── upload.py                  # POST /upload-resume
│       └── analyze.py                 # POST /analyze
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Main application component
        └── index.css                  # Glassmorphism theme & styles
```

---

## How It Works

1. **Upload Resume** — Select a PDF file. PyPDF2 extracts the text automatically.
2. **Paste Job Description** — Paste the full JD into the text area.
3. **Enter API Key** — Provide your Groq API key (stays on your machine, never stored).
4. **Analyze** — The backend sends resume + JD to Groq's `llama-3.3-70b-versatile` with a structured ATS prompt.
5. **Review Results** — Six score dimensions, keyword match percentage, matched/missing keywords, strengths & improvements, overall summary, and ATS readability score.

---

## Features

- **6 Scoring Dimensions** — Overall, Effectivity, Layout & Design, Content Relevance, Grammar & Syntax, Impact
- **Keyword Analysis** — Matched vs missing keywords with percentage match bar
- **Detailed Feedback** — Strengths (✅) and areas for improvement (🙈)
- **ATS Readability Score** — How well your resume parses in actual ATS systems
- **Glassmorphism UI** — Modern, animated interface with staggered card reveals
- **API Key Safety** — Your key is sent per-request, never persisted on the server

---

## Troubleshooting

| Issue                        | Solution                                                     |
|------------------------------|--------------------------------------------------------------|
| PDF upload fails             | Ensure the PDF contains selectable text (not scanned images) |
| Analysis returns error       | Verify your Groq API key is valid and has credits            |
| Backend won't start          | Check port 8001 is free (kill existing processes)            |
| Frontend can't reach backend | Ensure both servers are running simultaneously              |
