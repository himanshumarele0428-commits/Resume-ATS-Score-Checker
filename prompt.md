# Prompts Used in Resume ATS Score Checker

## 1. ATS Analysis System Prompt

This is the core prompt sent to the Groq LLM (`llama-3.3-70b-versatile`) for analyzing a resume against a job description.

**Template variables:** `{resume_text}` and `{jd_text}` are injected at runtime.

```
You are an expert ATS (Applicant Tracking System) analyst. Analyze the following resume against the job description provided.

## RESUME TEXT:
{resume_text}

## JOB DESCRIPTION:
{jd_text}

Perform a thorough ATS analysis and return your response as valid JSON only (no markdown, no backticks). Use this exact structure:

{
  "scores": {
    "overall": {"score": "0-10", "label": "Overall Result"},
    "effectivity": {"score": "0-10", "label": "Effectivity"},
    "layout_design": {"score": "0-10", "label": "Layout & Design"},
    "content_relevance": {"score": "0-10", "label": "Content Relevance"},
    "grammar_syntax": {"score": "0-10", "label": "Grammar & Syntax"},
    "impact": {"score": "0-10", "label": "Impact"}
  },
  "keyword_analysis": {
    "matched_keywords": ["keyword1", "keyword2"],
    "missing_keywords": ["keyword3", "keyword4"],
    "match_percentage": "0-100"
  },
  "detailed_feedback": {
    "strengths": ["✅ strength 1", "✅ strength 2"],
    "improvements": ["🙈 improvement 1", "🙈 improvement 2"]
  },
  "ats_readability_score": 0,
  "summary": "<2-3 sentence overall assessment>"
}

Rules:
- Score each dimension honestly on a scale of 0-10 where 0=terrible and 10=perfect.
- For strengths, prefix each item with ✅. For improvements, prefix each item with 🙈.
- Extract key technical skills, tools, and qualifications from the JD and check which appear in the resume.
- ats_readability_score (0-100) reflects how well the resume would parse in an actual ATS system. Consider formatting clarity, standard section headings, keyword placement, and absence of complex tables/images that confuse parsers.
- The "layout_design" score refers to visual appeal, organization, readability for human recruiters.
- Return ONLY the JSON object, nothing else. No markdown fences, no explanation.
```

---

## 2. Groq Chat Completion Call

| Parameter     | Value                          |
|---------------|--------------------------------|
| **Model**     | `llama-3.3-70b-versatile`     |
| **Role**      | `user`                          |
| **Temperature** | `0.3`                         |
| **Max Tokens**  | `2048`                        |

---

## 3. Expected Response Format

```json
{
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
    "strengths": [
      "✅ Strong technical skills section with measurable achievements",
      "✅ Good use of action verbs in experience descriptions"
    ],
    "improvements": [
      "🙈 Missing key JD keywords: Docker, Kubernetes",
      "🙈 Consider adding a professional summary at the top"
    ]
  },
  "ats_readability_score": 75,
  "summary": "The resume demonstrates solid technical experience but could better align with the specific keywords from the job description. Improving keyword density and adding missing skills would significantly boost ATS compatibility."
}
```

---

## 4. Response Cleaning (Post-Processing)

The raw LLM response is cleaned before JSON parsing:

```python
def _clean_json_response(self, raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)   # Strip leading ```json fences
    raw = re.sub(r"\s*```$", "", raw)             # Strip trailing ``` fences
    return raw
```

---

## File Source
- **Prompt definition:** `backend/services/ats_service.py` → `ATS_PROMPT_TEMPLATE`
- **Groq call:** `backend/services/ats_service.py` → `_call_groq()`
- **Response parsing:** `backend/services/ats_service.py` → `_clean_json_response()` + `analyze()`
