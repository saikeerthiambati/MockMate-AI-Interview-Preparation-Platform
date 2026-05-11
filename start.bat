@echo off
echo Starting MockMate AI...

echo.
echo [1/2] Starting Backend...
start cmd /k "cd backend && python -m venv venv 2>nul & venv\Scripts\activate && pip install -r requirements.txt && python main.py"

timeout /t 5 /nobreak >nul

echo [2/2] Starting Frontend...
start cmd /k "cd frontend && npm install && npm start"

echo.
echo MockMate AI is starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin: admin@mockmate.ai / admin123
pause
