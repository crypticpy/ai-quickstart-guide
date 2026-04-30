"""SQLite wrapper for the records table.

The original starter version of this module was vulnerable to SQL injection.
Lab task 1 replaces the vulnerable query with a parameterized version.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "records.db"

SEED_ROWS = [
    (1, "Alvarez", "Maria", "permit", "2025-11-02", "open"),
    (2, "Brooks", "Daniel", "permit", "2025-12-14", "closed"),
    (3, "Chen", "Lin", "code_enforcement", "2026-01-08", "open"),
    (4, "Diallo", "Awa", "utilities", "2026-01-22", "open"),
    (5, "Eriksen", "Per", "permit", "2026-02-03", "closed"),
    (6, "Foster", "Jamie", "code_enforcement", "2026-02-15", "open"),
    (7, "Grant", "Robin", "utilities", "2026-02-28", "closed"),
    (8, "Huang", "Wei", "permit", "2026-03-04", "open"),
    (9, "Ito", "Kaori", "code_enforcement", "2026-03-11", "open"),
    (10, "Johnson", "Pat", "utilities", "2026-03-19", "open"),
    (11, "Kapoor", "Anil", "permit", "2026-03-25", "closed"),
    (12, "Lopez", "Sofia", "code_enforcement", "2026-04-01", "open"),
    (13, "Martin", "Casey", "permit", "2026-04-07", "open"),
    (14, "Nguyen", "Binh", "utilities", "2026-04-12", "closed"),
    (15, "Owens", "Reese", "permit", "2026-04-18", "open"),
]


def get_connection():
    """Return a row-factory-enabled SQLite connection to the records DB."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the records table if missing and seed it once."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY,
            last_name TEXT NOT NULL,
            first_name TEXT NOT NULL,
            case_type TEXT NOT NULL,
            opened_on TEXT NOT NULL,
            status TEXT NOT NULL
        )
        """
    )
    cur.execute("SELECT COUNT(*) FROM records")
    if cur.fetchone()[0] == 0:
        cur.executemany(
            "INSERT INTO records VALUES (?, ?, ?, ?, ?, ?)",
            SEED_ROWS,
        )
    conn.commit()
    conn.close()


def find_by_last_name(last_name):
    """Return rows where the last name matches exactly.

    Uses a parameterized query so a malicious input like ``' OR '1'='1``
    is treated as a literal string and matches zero rows.
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM records WHERE last_name = ?", (last_name,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def all_records():
    """Return every row, ordered by id."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM records ORDER BY id")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows
