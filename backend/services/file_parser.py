"""
PDF text extraction utilities.
"""
import io
import logging
from pathlib import Path

import PyPDF2

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE_MB = 20


def validate_file(filename: str, file_bytes: bytes) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file format '{ext}'. Only PDF files are allowed."
        )
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise ValueError(
            f"File too large ({size_mb:.1f} MB). Max allowed: {MAX_FILE_SIZE_MB} MB."
        )


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
        return "\n\n".join(text_parts)
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise ValueError(f"Failed to extract text from PDF: {e}")


def parse_file(filename: str, file_bytes: bytes) -> str:
    validate_file(filename, file_bytes)
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise ValueError(
            "The uploaded PDF appears to be empty or contains no readable text."
        )

    logger.info(f"Extracted {len(text)} characters from '{filename}'.")
    return text
