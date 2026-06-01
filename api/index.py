"""
Vercel serverless entry point.
Sets VERCEL flag and imports the FastAPI app.
"""
import sys
import os

os.environ["VERCEL"] = "1"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
