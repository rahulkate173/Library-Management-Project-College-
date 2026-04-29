"""
Book CRUD routes — uses database helper functions (raw SQL, no ORM).
"""

from fastapi import APIRouter, HTTPException
from database import execute_query, fetch_all
from models import BookCreate, BookUpdate

router = APIRouter(prefix="/api/books", tags=["Books"])


@router.get("/")
def get_all_books():
    """Fetch all books."""
    rows = fetch_all("SELECT * FROM books")
    return rows


@router.post("/")
def add_book(book: BookCreate):
    """Add a new book."""
    result = execute_query(
        "INSERT INTO books (title, author, category, isbn, quantity) VALUES (%s, %s, %s, %s, %s)",
        (book.title, book.author, book.category, book.isbn, book.quantity),
    )
    return {"id": result["last_id"], "message": "Book added successfully"}


@router.put("/{book_id}")
def update_book(book_id: int, book: BookUpdate):
    """Update an existing book."""
    result = execute_query(
        "UPDATE books SET title=%s, author=%s, category=%s, isbn=%s, quantity=%s WHERE id=%s",
        (book.title, book.author, book.category, book.isbn, book.quantity, book_id),
    )
    if result["affected_rows"] == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book updated successfully"}


@router.delete("/{book_id}")
def delete_book(book_id: int):
    """Delete a book by ID."""
    result = execute_query("DELETE FROM books WHERE id=%s", (book_id,))
    if result["affected_rows"] == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book deleted successfully"}
