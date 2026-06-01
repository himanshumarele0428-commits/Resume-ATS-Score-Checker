"""
ATS Analysis Service - uses Groq/Gemini LLM to analyze resumes against job descriptions.
"""
import json
import logging
import re

from groq import Groq

logger = logging.getLogger(__name__)

ATS_PROMPT_TEMPLATE = """You are an expert ATS (Applicant Tracking System) analyst. Analyze the following resume against the job description provided.

## RESUME TEXT:
{resume_text}

## JOB DESCRIPTION:
{jd_text}

Perform a thorough ATS analysis and return your response as valid JSON only (no markdown, no backticks). Use this exact structure:

{{
  "scores": {{
    "overall": {{"score": "0-10", "label": "Overall Result"}},
    "effectivity": {{"score": "0-10", "label": "Effectivity"}},
    "layout_design": {{"score": "0-10", "label": "Layout & Design"}},
    "content_relevance": {{"score": "0-10", "label": "Content Relevance"}},
    "grammar_syntax": {{"score": "0-10", "label": "Grammar & Syntax"}},
    "impact": {{"score": "0-10", "label": "Impact"}}
  }},
  "keyword_analysis": {{
    "matched_keywords": ["keyword1", "keyword2"],
    "missing_keywords": ["keyword3", "keyword4"],
    "match_percentage": "0-100"
  }},
  "detailed_feedback": {{
    "strengths": ["✅ strength 1", "✅ strength 2"],
    "improvements": ["🙈 improvement 1", "🙈 improvement 2"]
  }},
  "ats_readability_score": 0,
  "summary": "<2-3 sentence overall assessment>"
}}

Rules:
- Score each dimension honestly on a scale of 0-10 where 0=terrible and 10=perfect.
- For strengths, prefix each item with ✅. For improvements, prefix each item with 🙈.
- Extract key technical skills, tools, and qualifications from the JD and check which appear in the resume.
- ats_readability_score (0-100) reflects how well the resume would parse in an actual ATS system. Consider formatting clarity, standard section headings, keyword placement, and absence of complex tables/images that confuse parsers.
- The "layout_design" score refers to visual appeal, organization, readability for human recruiters.
- Return ONLY the JSON object, nothing else. No markdown fences, no explanation."""


class ATSService:
    def __init__(self, api_key: str, provider: str = "groq"):
        self.api_key = api_key
        self.provider = provider.lower()

        if self.provider == "groq":
            self.client = Groq(api_key=self.api_key)
            self.model = "llama-3.3-70b-versatile"
        else:
            raise ValueError(f"Unsupported provider: {provider}. Use 'groq'.")

    def _clean_json_response(self, raw: str) -> str:
        raw = raw.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return raw

    def _call_groq(self, prompt: str) -> dict:
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.3,
                max_tokens=2048,
            )
            raw = chat_completion.choices[0].message.content
            logger.info(f"Groq raw response length: {len(raw)} chars")
            cleaned = self._clean_json_response(raw)
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}\nRaw: {raw[:500]}")
            raise ValueError(
                "The AI returned an invalid response format. Please try again."
            )
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise ValueError(f"AI analysis failed: {str(e)}")

    def analyze(self, resume_text: str, jd_text: str) -> dict:
        prompt = ATS_PROMPT_TEMPLATE.format(
            resume_text=resume_text, jd_text=jd_text
        )

        result = self._call_groq(prompt)

        scores = result.get("scores", {})
        for key in scores:
            score_val = scores[key].get("score")
            if isinstance(score_val, str):
                try:
                    scores[key]["score"] = float(score_val)
                except (ValueError, TypeError):
                    scores[key]["score"] = 0
            elif isinstance(score_val, (int, float)):
                scores[key]["score"] = float(score_val)

        kw = result.get("keyword_analysis", {})
        match_pct = kw.get("match_percentage")
        if isinstance(match_pct, str):
            try:
                kw["match_percentage"] = float(match_pct)
            except (ValueError, TypeError):
                kw["match_percentage"] = 0
        elif isinstance(match_pct, (int, float)):
            kw["match_percentage"] = float(match_pct)

        readability = result.get("ats_readability_score")
        if isinstance(readability, str):
            try:
                result["ats_readability_score"] = float(readability)
            except (ValueError, TypeError):
                result["ats_readability_score"] = 0
        elif isinstance(readability, (int, float)):
            result["ats_readability_score"] = float(readability)

        return result
