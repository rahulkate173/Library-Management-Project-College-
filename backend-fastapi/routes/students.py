"""
Student CRUD routes — uses database helper functions (raw SQL, no ORM).
"""

from fastapi import APIRouter, HTTPException
from database import execute_query, fetch_all
from models import StudentCreate, StudentUpdate

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("/")
def get_all_students():
    """Fetch all students."""
    rows = fetch_all("SELECT * FROM students")
    return rows


@router.post("/")
def add_student(student: StudentCreate):
    """Add a new student."""
    result = execute_query(
        "INSERT INTO students (name, email, phone) VALUES (%s, %s, %s)",
        (student.name, student.email, student.phone),
    )
    return {"id": result["last_id"], "message": "Student added successfully"}


@router.put("/{student_id}")
def update_student(student_id: int, student: StudentUpdate):
    """Update an existing student."""
    result = execute_query(
        "UPDATE students SET name=%s, email=%s, phone=%s WHERE id=%s",
        (student.name, student.email, student.phone, student_id),
    )
    if result["affected_rows"] == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student updated successfully"}


@router.delete("/{student_id}")
def delete_student(student_id: int):
    """Delete a student by ID."""
    result = execute_query("DELETE FROM students WHERE id=%s", (student_id,))
    if result["affected_rows"] == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}
