from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import sqlite3
from database import DB_PATH
from auth_utils import require_admin

router = APIRouter()

@router.get("/users")
def get_users(user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    users = conn.execute("SELECT id, full_name, college_name, email, role, created_at FROM users ORDER BY id").fetchall()
    conn.close()
    return [dict(u) for u in users]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM users WHERE id=? AND role != 'admin'", (user_id,))
    conn.commit()
    conn.close()
    return {"message": "User deleted"}

@router.get("/stats")
def admin_stats(user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    total_users = conn.execute("SELECT COUNT(*) FROM users WHERE role='student'").fetchone()[0]
    total_sessions = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
    total_questions = conn.execute("SELECT COUNT(*) FROM questions WHERE is_active=1").fetchone()[0]
    avg_score = conn.execute("SELECT AVG(score) FROM sessions WHERE score > 0").fetchone()[0]
    recent_sessions = conn.execute('''SELECT s.*, u.full_name FROM sessions s
                                       JOIN users u ON s.user_id = u.id
                                       ORDER BY s.created_at DESC LIMIT 10''').fetchall()
    conn.close()
    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_questions": total_questions,
        "avg_score": round(avg_score or 0, 1),
        "recent_sessions": [dict(s) for s in recent_sessions]
    }

class UpdateUserRole(BaseModel):
    role: str

@router.patch("/users/{user_id}/role")
def update_role(user_id: int, body: UpdateUserRole, user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE users SET role=? WHERE id=?", (body.role, user_id))
    conn.commit()
    conn.close()
    return {"message": "Role updated"}
