"""
Resume ATS Score Checker API
"""
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import upload, analyze

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

is_vercel = os.environ.get("VERCEL") == "1"

app = FastAPI(
    title="Resume ATS Score Checker API",
    root_path="/_/backend" if is_vercel else "",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload-resume", tags=["Upload"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])


@app.get("/")
async def health():
    return {"status": "ok", "service": "Resume ATS Score Checker API"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
