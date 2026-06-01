"""
Upload router - handles PDF resume upload and text extraction.
"""
import logging

from fastapi import APIRouter, File, UploadFile, HTTPException

from services.file_parser import parse_file

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/")
async def upload_resume(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename} ({file.content_type})")
    try:
        file_bytes = await file.read()
        text = parse_file(file.filename, file_bytes)
        return {
            "success": True,
            "filename": file.filename,
            "resume_text": text,
            "characters": len(text),
            "preview": text[:300] + ("..." if len(text) > 300 else ""),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal error processing file: {e}"
        )
