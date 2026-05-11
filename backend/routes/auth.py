from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sqlite3
from database import DB_PATH
from auth_utils import hash_password, verify_password, create_token, get_current_user

router = APIRouter()

class RegisterRequest(BaseModel):
    full_name: str
    college_name: str = ""
    year_of_study: int = 1
    graduation_year: int = 2025
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    existing = conn.execute("SELECT id FROM users WHERE email=?", (req.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    c = conn.cursor()
    c.execute('''INSERT INTO users (full_name, college_name, year_of_study, graduation_year, email, password_hash)
                 VALUES (?,?,?,?,?,?)''',
              (req.full_name, req.college_name, req.year_of_study, req.graduation_year,
               req.email, hash_password(req.password)))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    token = create_token(user_id, "student")
    return {"token": token, "user": {"id": user_id, "full_name": req.full_name, "email": req.email, "role": "student"}}

@router.post("/login")
def login(req: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE email=?", (req.email,)).fetchone()
    conn.close()
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {"id": user["id"], "full_name": user["full_name"],
                                      "email": user["email"], "role": user["role"],
                                      "college_name": user["college_name"]}}

@router.get("/me")
def me(user=Depends(get_current_user)):
    return user
