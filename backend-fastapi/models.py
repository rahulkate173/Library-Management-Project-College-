"""
Pydantic models (schemas) for request / response validation.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from decimal import Decimal


# ── Auth ───────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


# ── Books ──────────────────────────────────────────────────────────
class BookCreate(BaseModel):
    title: str
    author: str
    category: Optional[str] = None
    isbn: Optional[str] = None
    quantity: int = 0


class BookUpdate(BaseModel):
    title: str
    author: str
    category: Optional[str] = None
    isbn: Optional[str] = None
    quantity: int = 0


# ── Students ───────────────────────────────────────────────────────
class StudentCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None


class StudentUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None


# ── Transactions ───────────────────────────────────────────────────
class IssueBook(BaseModel):
    book_id: int
    student_id: int
    issue_date: date


class ReturnBook(BaseModel):
    transaction_id: int
    return_date: date
    fine: Decimal = Decimal("0.00")
