"""
Library Management System — FastAPI Backend
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.auth import router as auth_router
from routes.books import router as books_router
from routes.students import router as students_router
from routes.transactions import router as transactions_router

load_dotenv()

app = FastAPI(
    title="Library Management System API",
    description="FastAPI backend with MySQL (raw SQL functions, no ORM)",
    version="1.0.0",
)

# ── CORS (allow frontend to call the API) ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(students_router)
app.include_router(transactions_router)


# ── Health check ───────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Library Management System API is running..."}


# ── Run with: uvicorn main:app --reload ────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
