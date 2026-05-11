#!/bin/bash
echo "Starting MockMate AI..."

# Backend
echo "[1/2] Starting Backend..."
cd backend
python3 -m venv venv 2>/dev/null
source venv/bin/activate
pip install -r requirements.txt -q
python main.py &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
cd ..

sleep 3

# Frontend
echo "[2/2] Starting Frontend..."
cd frontend
npm install -q
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "✅ MockMate AI is running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   Admin:    admin@mockmate.ai / admin123"
echo ""
echo "Press Ctrl+C to stop all services"

wait $BACKEND_PID $FRONTEND_PID
