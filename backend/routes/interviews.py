from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import sqlite3, json
from database import DB_PATH
from auth_utils import get_current_user
from ai_evaluator import evaluate_answer, generate_personalized_suggestions

router = APIRouter()

class StartSessionRequest(BaseModel):
    category: str
    subject: Optional[str] = None
    session_type: str  # mcq, coding, interview

class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_id: int
    question_text: str
    user_answer: str
    reference_answer: Optional[str] = ""
    selected_option: Optional[str] = None  # for MCQ

class FinishSessionRequest(BaseModel):
    session_id: int
    mcq_results: Optional[List[dict]] = None  # for MCQ sessions

@router.post("/start")
def start_session(req: StartSessionRequest, user=Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO sessions (user_id, category, subject, session_type)
                 VALUES (?,?,?,?)''', (user["id"], req.category, req.subject, req.session_type))
    conn.commit()
    session_id = c.lastrowid
    conn.close()
    return {"session_id": session_id}

@router.post("/submit-answer")
def submit_answer(req: SubmitAnswerRequest, user=Depends(get_current_user)):
    # Evaluate using AI
    result = evaluate_answer(req.question_text, req.user_answer, req.reference_answer or "")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO answers (session_id, question_id, user_answer, similarity_score,
                 concept_clarity, communication_score, overall_score, feedback,
                 areas_to_improve, suggestions, what_to_add)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
              (req.session_id, req.question_id, req.user_answer,
               result["similarity_score"], result["concept_clarity"],
               result["communication_score"], result["overall_score"],
               result["feedback"],
               json.dumps(result["areas_to_improve"]),
               json.dumps(result["suggestions"]),
               json.dumps(result["what_to_add"])))
    conn.commit()
    conn.close()
    return result

@router.post("/finish")
def finish_session(req: FinishSessionRequest, user=Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Calculate session score
    if req.mcq_results:
        # MCQ scoring
        correct = sum(1 for r in req.mcq_results if r.get("is_correct"))
        total = len(req.mcq_results)
        score = (correct / total * 100) if total > 0 else 0
        answered = total
    else:
        # Interview scoring from answers table
        answers = conn.execute('''SELECT overall_score FROM answers WHERE session_id=?''',
                               (req.session_id,)).fetchall()
        scores = [a["overall_score"] for a in answers]
        score = sum(scores) / len(scores) if scores else 0
        answered = len(scores)
        total = 5  # default interview questions

    # Determine verdict
    if score >= 80:
        verdict = "Excellent"
    elif score >= 65:
        verdict = "Good"
    elif score >= 50:
        verdict = "Average"
    elif score >= 35:
        verdict = "Needs Work"
    else:
        verdict = "Poor"

    conn.execute('''UPDATE sessions SET score=?, total_questions=?, answered=?, verdict=?
                    WHERE id=?''', (round(score, 1), total, answered, verdict, req.session_id))
    conn.commit()

    # Get personalized suggestions
    sessions_raw = conn.execute('''SELECT category, score FROM sessions WHERE user_id=? AND score > 0''',
                                (user["id"],)).fetchall()
    sessions_list = [dict(s) for s in sessions_raw]
    suggestions = generate_personalized_suggestions(sessions_list)

    conn.close()
    return {
        "session_id": req.session_id,
        "score": round(score, 1),
        "verdict": verdict,
        "answered": answered,
        "total": total,
        "suggestions": suggestions
    }

@router.get("/history")
def get_history(user=Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    sessions = conn.execute('''SELECT * FROM sessions WHERE user_id=? ORDER BY created_at DESC LIMIT 20''',
                            (user["id"],)).fetchall()
    conn.close()
    return [dict(s) for s in sessions]

@router.get("/session/{session_id}/answers")
def get_session_answers(session_id: int, user=Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    answers = conn.execute('''SELECT a.*, q.question FROM answers a
                               LEFT JOIN questions q ON a.question_id = q.id
                               WHERE a.session_id=?''', (session_id,)).fetchall()
    conn.close()
    result = []
    for a in answers:
        d = dict(a)
        for field in ['areas_to_improve', 'suggestions', 'what_to_add']:
            try:
                d[field] = json.loads(d[field]) if d[field] else []
            except:
                d[field] = []
        result.append(d)
    return result
