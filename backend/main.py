from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from database import init_db
from routes import auth, questions, interviews, admin, analytics, streak

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="MockMate AI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(streak.router, prefix="/api/streak", tags=["streak"])

@app.get("/")
def root():
    return {"message": "MockMate AI API Running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)