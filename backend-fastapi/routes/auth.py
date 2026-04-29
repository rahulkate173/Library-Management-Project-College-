"""
Auth routes — simple admin login (matches Node.js version).
"""

from fastapi import APIRouter, HTTPException
from models import LoginRequest

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login")
def login(payload: LoginRequest):
    """Simple hardcoded admin login (same as the Express version)."""
    if payload.username == "admin" and payload.password == "admin123":
        return {
            "success": True,
            "user": {"username": "admin"},
            "token": "mock-jwt-token",
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")
