import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sqlite3
from database import DB_PATH

SECRET_KEY = os.getenv("SECRET_KEY", "mockmate_secret_key_2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

def hash_password(password: str) -> str:
    try:
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        if isinstance(hashed, bytes):
            return hashed.decode('utf-8')
        return hashed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password hashing failed: {str(e)}")

def verify_password(password: str, hashed: str) -> bool:
    try:
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8') if isinstance(hashed, str) else hashed
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

def create_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user_id = int(payload["sub"])
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
