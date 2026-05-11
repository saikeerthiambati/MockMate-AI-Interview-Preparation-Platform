# MockMate AI 🎯
### AI-Powered Interview Preparation Platform

---

## 🏗️ Project Structure

```
mockmate/
├── backend/               # FastAPI Python backend
│   ├── main.py            # App entry point
│   ├── database.py        # SQLite setup + data seeding
│   ├── auth_utils.py      # JWT + Bcrypt auth
│   ├── ai_evaluator.py    # Sentence Transformers AI evaluation
│   ├── requirements.txt   # Python dependencies
│   └── routes/
│       ├── auth.py        # Register, Login, Me
│       ├── questions.py   # MCQ, Coding, Interview questions
│       ├── interviews.py  # Session management + AI eval
│       ├── analytics.py   # Performance analytics
│       └── admin.py       # Admin user/question management
├── frontend/              # React frontend
│   ├── public/index.html
│   ├── package.json
│   └── src/
│       ├── App.js         # Routing
│       ├── index.css      # Global dark theme styles
│       ├── context/AuthContext.js
│       ├── utils/api.js
│       ├── components/
│       │   ├── Navbar.js
│       │   └── Timer.js
│       └── pages/
│           ├── HomePage.js
│           ├── LoginPage.js      (also exports RegisterPage)
│           ├── RegisterPage.js
│           ├── Dashboard.js
│           ├── SubjectSelect.js  (also exports ModeSelect)
│           ├── ModeSelect.js
│           ├── MCQTest.js
│           ├── CodingTest.js
│           ├── InterviewSession.js
│           ├── AnalysisPage.js
│           └── AdminPage.js
└── data/                  # CSV question datasets
    ├── HR_Questions.csv
    ├── Communication_Questions.csv
    ├── Software_Questions.csv
    └── full_interview_questions_dataset.csv
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip
- npm

---

### 1. Backend Setup

```bash
cd mockmate/backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend runs on **http://localhost:8000**

> **Note:** First run downloads the Sentence Transformers model (~90MB). This may take a minute.

---

### 2. Frontend Setup

```bash
cd mockmate/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend runs on **http://localhost:3000**

---

## 🔑 Default Admin Credentials

```
Email:    admin@mockmate.ai
Password: admin123
```

---

## 🎮 Features

### Student Role
| Feature | Description |
|--------|-------------|
| **Register/Login** | Full Name, College, Year, Graduation Year, Email, Password |
| **Dashboard** | Stats, category select, answer modes, tips, resources |
| **Technical** | Choose subject → MCQ / Coding / Interview |
| **HR Interview** | 5 behavioral questions, text or voice |
| **Communication** | 5 communication questions, text or voice |
| **MCQ Test** | 10 questions, 30s timer per question |
| **Coding Test** | 1 problem per session, 5 min timer |
| **Mock Interview** | 5 questions, 1 min timer per question |
| **AI Evaluation** | Semantic similarity, concept clarity, communication score |
| **Voice Mode** | Web Speech API for voice answers |
| **Timer Toggle** | Enable/disable timer on every screen |
| **Dark Mode** | Toggle on every screen |
| **Analysis Page** | Performance by category, trend chart, weak areas, recommendations |
| **Learning Resources** | Clickable links to platforms, articles, YouTube channels |

### Admin Role
| Feature | Description |
|--------|-------------|
| **Admin Panel** | Overview stats, manage users, manage questions |
| **User Management** | View all users, delete students |
| **Question Management** | Add/delete questions per category/subject |
| **Activity Overview** | Recent sessions across all users |

---

## 🤖 AI Evaluation System

Uses **Sentence Transformers** (`all-MiniLM-L6-v2`) for semantic similarity:

- **Similarity Score** (0-100%): Compares user answer to reference using cosine similarity
- **Concept Clarity** (0-100%): Based on answer length, sentence structure, connective words
- **Communication Score** (0-100%): Penalizes filler words, rewards structured responses
- **Overall Score**: Weighted combination of above metrics
- **Verdicts**: Excellent (80+), Good (65+), Average (50+), Needs Work (35+), Poor (<35)
- **Personalized Feedback**: Areas to improve, suggestions, what to add

---

## 📊 Timer Durations

| Test Type | Timer |
|-----------|-------|
| MCQ per question | 30 seconds |
| Coding problem | 5 minutes |
| Interview per question | 1 minute |
| Timer can be enabled/disabled on every screen ||

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Recharts, Lucide React |
| Backend | Python FastAPI, Uvicorn |
| Database | SQLite (via Python sqlite3) |
| AI Model | Sentence Transformers (all-MiniLM-L6-v2) |
| Auth | JWT (PyJWT) + Bcrypt |
| Voice | Web Speech API (browser native) |

---

## 📝 Notes

- The SQLite database (`mockmate.db`) is auto-created on first run
- Questions are auto-seeded from the CSV files in `/data/`
- Voice recognition requires Chrome browser for best results
- The AI model downloads automatically on first backend start
