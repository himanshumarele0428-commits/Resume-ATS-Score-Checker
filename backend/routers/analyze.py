"""
Analyze router - receives resume text + JD and returns ATS analysis.
"""
import asyncio
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.ats_service import ATSService

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str
    api_key: str
    provider: str = "groq"


@router.post("/")
async def analyze(req: AnalyzeRequest):
    if not req.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
    if not req.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")
    if not req.api_key.strip():
        raise HTTPException(status_code=400, detail="API key is required.")

    logger.info(
        f"Analyze request: resume={len(req.resume_text)} chars, jd={len(req.jd_text)} chars, provider={req.provider}"
    )

    try:
        service = ATSService(api_key=req.api_key, provider=req.provider)
        result = await asyncio.to_thread(
            service.analyze, req.resume_text, req.jd_text
        )
        return {"success": True, "analysis": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal error during analysis: {e}"
        )
