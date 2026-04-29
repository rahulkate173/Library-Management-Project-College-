"""
Transaction routes — issue / return books, dashboard stats.
Uses database helper functions (raw SQL, no ORM).
"""

from fastapi import APIRouter, HTTPException
from database import execute_query, fetch_all, fetch_one
from models import IssueBook, ReturnBook

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("/")
def get_all_transactions():
    """Fetch all transactions with book title and student name."""
    query = """
        SELECT t.*, b.title AS book_title, s.name AS student_name
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN students s ON t.student_id = s.id
        ORDER BY t.issue_date DESC
    """
    rows = fetch_all(query)
    return rows


@router.post("/issue")
def issue_book(payload: IssueBook):
    """Issue a book to a student (decrements quantity)."""
    # Check availability
    book = fetch_one("SELECT quantity FROM books WHERE id = %s", (payload.book_id,))
    if book is None or book["quantity"] <= 0:
        raise HTTPException(status_code=400, detail="Book not available")

    # Create transaction
    execute_query(
        "INSERT INTO transactions (book_id, student_id, issue_date, status) VALUES (%s, %s, %s, %s)",
        (payload.book_id, payload.student_id, payload.issue_date, "issued"),
    )

    # Decrement book quantity
    execute_query(
        "UPDATE books SET quantity = quantity - 1 WHERE id = %s", (payload.book_id,)
    )

    return {"message": "Book issued successfully"}


@router.post("/return")
def return_book(payload: ReturnBook):
    """Return a book (increments quantity, records fine)."""
    # Verify transaction
    txn = fetch_one(
        "SELECT * FROM transactions WHERE id = %s", (payload.transaction_id,)
    )
    if txn is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn["status"] == "returned":
        raise HTTPException(status_code=400, detail="Book already returned")

    # Update transaction
    execute_query(
        "UPDATE transactions SET return_date = %s, fine = %s, status = %s WHERE id = %s",
        (payload.return_date, float(payload.fine), "returned", payload.transaction_id),
    )

    # Increment book quantity
    execute_query(
        "UPDATE books SET quantity = quantity + 1 WHERE id = %s", (txn["book_id"],)
    )

    return {"message": "Book returned successfully"}


@router.get("/stats")
def get_dashboard_stats():
    """Dashboard statistics — total books, issued, students, overdue."""
    total_books = fetch_one("SELECT SUM(quantity) AS count FROM books")
    unique_books = fetch_one("SELECT COUNT(*) AS count FROM books")
    issued_books = fetch_one(
        "SELECT COUNT(*) AS count FROM transactions WHERE status = 'issued'"
    )
    total_students = fetch_one("SELECT COUNT(*) AS count FROM students")
    overdue = fetch_one(
        """
        SELECT COUNT(*) AS count FROM transactions
        WHERE status = 'issued' AND DATEDIFF(CURDATE(), issue_date) > 14
    """
    )

    return {
        "total_quantity": total_books["count"] or 0 if total_books else 0,
        "unique_books": unique_books["count"] if unique_books else 0,
        "issued_books": issued_books["count"] if issued_books else 0,
        "total_students": total_students["count"] if total_students else 0,
        "overdue_books": overdue["count"] if overdue else 0,
    }
