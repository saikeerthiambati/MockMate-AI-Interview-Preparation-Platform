from fastapi import APIRouter, Depends
import sqlite3
from datetime import datetime, date, timedelta
from database import DB_PATH
from auth_utils import get_current_user

router = APIRouter()

def get_streak_data(user_id: int) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Get all session dates for this user (distinct dates)
    rows = conn.execute('''
        SELECT DISTINCT DATE(created_at) as session_date
        FROM sessions
        WHERE user_id = ?
        ORDER BY session_date DESC
    ''', (user_id,)).fetchall()
    conn.close()

    if not rows:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "practiced_today": False,
            "streak_dates": [],
            "total_days": 0,
            "last_practiced": None
        }

    session_dates = [row["session_date"] for row in rows]
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    practiced_today = today in session_dates

    # Calculate current streak
    current_streak = 0
    check_date = date.today()

    # If not practiced today, start from yesterday
    if not practiced_today:
        check_date = date.today() - timedelta(days=1)

    while check_date.isoformat() in session_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    # Calculate longest streak
    longest_streak = 0
    temp_streak = 1
    sorted_dates = sorted(session_dates)

    for i in range(1, len(sorted_dates)):
        d1 = date.fromisoformat(sorted_dates[i - 1])
        d2 = date.fromisoformat(sorted_dates[i])
        if (d2 - d1).days == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1
    longest_streak = max(longest_streak, temp_streak)

    # Last 7 days for calendar display
    last_7 = [(date.today() - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
    streak_calendar = [{"date": d, "practiced": d in session_dates} for d in last_7]

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "practiced_today": practiced_today,
        "streak_dates": streak_calendar,
        "total_days": len(session_dates),
        "last_practiced": session_dates[0] if session_dates else None
    }


@router.get("/")
def get_streak(user=Depends(get_current_user)):
    return get_streak_data(user["id"])