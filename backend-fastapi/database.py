"""
Database connection module using mysql-connector-python.
Uses a connection pool and exposes helper functions for executing queries.
No ORM — all queries are raw SQL.
"""

import os
import mysql.connector
from mysql.connector import pooling, Error
from dotenv import load_dotenv

load_dotenv()

# ── Connection pool configuration ──────────────────────────────────
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "library_db"),
}

# Create a connection pool (re-uses connections just like the Node.js pool)
try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="library_pool",
        pool_size=10,
        pool_reset_session=True,
        **DB_CONFIG,
    )
    print("✅ MySQL connection pool created successfully")
except Error as e:
    print(f"❌ Error creating MySQL connection pool: {e}")
    connection_pool = None


# ── Helper functions ───────────────────────────────────────────────

def get_connection():
    """Get a connection from the pool."""
    if connection_pool is None:
        raise Exception("Database connection pool is not initialised")
    return connection_pool.get_connection()


def execute_query(query: str, params: tuple = None):
    """
    Execute an INSERT / UPDATE / DELETE query.
    Returns the lastrowid for INSERT, or the rowcount for UPDATE/DELETE.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        conn.commit()
        last_id = cursor.lastrowid
        affected = cursor.rowcount
        return {"last_id": last_id, "affected_rows": affected}
    except Error as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def fetch_all(query: str, params: tuple = None) -> list[dict]:
    """
    Execute a SELECT query and return all rows as a list of dicts.
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return rows
    except Error as e:
        raise e
    finally:
        cursor.close()
        conn.close()


def fetch_one(query: str, params: tuple = None) -> dict | None:
    """
    Execute a SELECT query and return a single row as a dict (or None).
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params)
        row = cursor.fetchone()
        return row
    except Error as e:
        raise e
    finally:
        cursor.close()
        conn.close()
