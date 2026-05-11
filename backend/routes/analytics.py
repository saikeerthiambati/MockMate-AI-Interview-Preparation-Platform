from fastapi import APIRouter, Depends
import sqlite3, json
from database import DB_PATH
from auth_utils import get_current_user
from ai_evaluator import generate_personalized_suggestions

router = APIRouter()

LEARNING_RESOURCES = {
    "Technical": [
        {"name": "LeetCode", "url": "https://leetcode.com", "type": "Platform", "desc": "Practice DSA problems"},
        {"name": "GeeksforGeeks", "url": "https://geeksforgeeks.org", "type": "Platform", "desc": "CS fundamentals"},
        {"name": "NeetCode", "url": "https://neetcode.io", "type": "Platform", "desc": "Guided coding roadmap"},
        {"name": "Striver", "url": "https://takeuforward.org", "type": "Channel", "desc": "DSA & CP"},
        {"name": "Apna College", "url": "https://www.youtube.com/@ApnaCollegeOfficial", "type": "Channel", "desc": "Programming in Hindi"},
    ],
    "HR": [
        {"name": "STAR Method Guide", "url": "https://www.themuse.com/advice/star-interview-method", "type": "Article", "desc": "Structure behavioral answers"},
        {"name": "Top 50 HR Questions", "url": "https://www.indiabix.com/hr-interview/questions-and-answers/", "type": "Article", "desc": "Most asked HR questions"},
        {"name": "Mock Interview Tips", "url": "https://www.indeed.com/career-advice/interviewing/mock-interview", "type": "Guide", "desc": "Behavioral round prep"},
        {"name": "CareerVidz", "url": "https://www.youtube.com/@CareerVidz", "type": "Channel", "desc": "Interview Q&A"},
    ],
    "Communication": [
        {"name": "TED Talks", "url": "https://www.ted.com/topics/communication", "type": "Video", "desc": "Learn from best speakers"},
        {"name": "Toastmasters", "url": "https://www.toastmasters.org/resources", "type": "Guide", "desc": "Speaking confidence"},
        {"name": "English Speaking Practice", "url": "https://www.englishclub.com/speaking/", "type": "Platform", "desc": "Daily fluency practice"},
        {"name": "Communication - Coursera", "url": "https://www.coursera.org/courses?query=communication+skills", "type": "Course", "desc": "Structured courses"},
    ],
}

@router.get("/dashboard")
def dashboard(user=Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    uid = user["id"]
    total_sessions = conn.execute("SELECT COUNT(*) FROM sessions WHERE user_id=?", (uid,)).fetchone()[0]
    avg_score_row = conn.execute("SELECT AVG(score) FROM sessions WHERE user_id=? AND score > 0", (uid,)).fetchone()
    avg_score = round(avg_score_row[0] or 0, 1)
    best_row = conn.execute("SELECT verdict FROM sessions WHERE user_id=? ORDER BY score DESC LIMIT 1", (uid,)).fetchone()
    best_verdict = best_row[0] if best_row else "—"
    conn.close()
    return {
        "total_sessions": total_sessions,
        "avg_score": avg_score,
        "best_verdict": best_verdict,
    }

@router.get("/performance")
def performance(user=Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    uid = user["id"]

    sessions = conn.execute(
        "SELECT category, subject, session_type, score, verdict, created_at FROM sessions WHERE user_id=? AND score > 0 ORDER BY created_at",
        (uid,)
    ).fetchall()
    sessions_list = [dict(s) for s in sessions]

    # Per category
    categories = {}
    for s in sessions_list:
        cat = s["category"]
        if cat not in categories:
            categories[cat] = {"scores": [], "sessions": []}
        categories[cat]["scores"].append(s["score"])
        categories[cat]["sessions"].append(s)

    performance_data = {}
    for cat, data in categories.items():
        scores = data["scores"]
        performance_data[cat] = {
            "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "total_sessions": len(scores),
            "best_score": round(max(scores), 1) if scores else 0,
            "sessions": data["sessions"],  # all sessions for table
        }

    # Overall
    all_scores = [s["score"] for s in sessions_list]
    overall_avg = sum(all_scores) / len(all_scores) if all_scores else 0
    level = "Expert" if overall_avg >= 80 else "Intermediate" if overall_avg >= 65 else "Beginner" if overall_avg >= 40 else "Novice"

    # Weak areas
    answers = conn.execute(
        "SELECT a.areas_to_improve FROM answers a JOIN sessions s ON a.session_id = s.id WHERE s.user_id=?",
        (uid,)
    ).fetchall()
    weak_counts = {}
    for a in answers:
        try:
            areas = json.loads(a["areas_to_improve"]) if a["areas_to_improve"] else []
            for area in areas:
                weak_counts[area] = weak_counts.get(area, 0) + 1
        except:
            pass
    weak_areas = sorted(weak_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    suggestions = generate_personalized_suggestions(sessions_list)
    conn.close()

    return {
        "overall_avg": round(overall_avg, 1),
        "level": level,
        "total_sessions": len(sessions_list),
        "performance_by_category": performance_data,
        "weak_areas": [{"area": a, "count": c} for a, c in weak_areas],
        "suggestions": suggestions["suggestions"],
        "learning_resources": LEARNING_RESOURCES,
        # trend with category info
        "score_trend": [{"session": i + 1, "score": s["score"], "category": s["category"]} for i, s in enumerate(sessions_list)],
    }