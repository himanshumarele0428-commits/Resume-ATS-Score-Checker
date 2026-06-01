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



Prompt2: 

e:\Antigravity\Project1_Basics\Project29_ResumeATSChecker I want you  
  to create an application with the name of "Resume ATS Score
  Checker".You can use a backend as Python and a frontend as a react    
  We have to provide an option to upload Put the PDF file and also you  
   have to provide the option as text field to provide the job details  
You are an analytical the below task ## Role
  expert with strong research capabilities, skilled in data
  interpretation, pattern recognition, and delivering actionable        
Analyze the attached resume: Attached
  PramodResume.pdf and the JobDescription, Provide a detailed review    
  in the following format:\n\n" "1. Overall Result: [Score out of       
  10]\n" "2. Effectivity: [Score out of 10] with feedback on how        
  effectively the resume presents the applicant's skills and
  experiences.\n" "3. Layout and Design: [Score out of 10] with
  comments on the visual appeal and organization of the resume.\n" "4.  
   Content Relevance: [Score out of 10] with insights on the relevance  
   and adequacy of the information provided.\n" "5. Grammar and
  Syntax: [Score out of 10] with observations on the language quality   
  and readability.\n" "6. Impact: [Score out of 10] with thoughts on    
  how the resume stands out or catches attention.\n\n" "Use symbols     
## Key ✅ for positive aspects and 🙈 for areas of improvement.
1. Please analyze the keywords descriptions
2. We need to check. Youon with the resume.
  have to act as an ATS, which is Applicant Tracking System or
  Application Tracking System, which basically checks for t those       
  keywords. So we need to make sure that theshe keywords and
3. The fullons in your resume. So yoe are available.
## Expectedhave already given you in the instructions.
Please provide a thorough analysis with key findings,
u insights, and recommendations. Use data to support conclusions.       
  need to make sure that our resume is not missing 
──────────────────────────────────────────────────────────