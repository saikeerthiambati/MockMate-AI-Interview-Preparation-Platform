import sqlite3
import csv
import os
import json

DB_PATH = "mockmate.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        college_name TEXT,
        year_of_study INTEGER,
        graduation_year INTEGER,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # Questions table
    c.execute('''CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT,
        category TEXT NOT NULL,
        subject TEXT,
        difficulty TEXT DEFAULT 'Medium',
        question_type TEXT DEFAULT 'interview',
        option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
        correct_option TEXT,
        created_by INTEGER,
        is_active INTEGER DEFAULT 1
    )''')

    # Sessions table
    c.execute('''CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        subject TEXT,
        session_type TEXT NOT NULL,
        score REAL DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        answered INTEGER DEFAULT 0,
        verdict TEXT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')

    # Answers table
    c.execute('''CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        user_answer TEXT,
        similarity_score REAL DEFAULT 0,
        concept_clarity REAL DEFAULT 0,
        communication_score REAL DEFAULT 0,
        overall_score REAL DEFAULT 0,
        feedback TEXT,
        areas_to_improve TEXT,
        suggestions TEXT,
        what_to_add TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
    )''')

    conn.commit()

    # Seed questions
    _seed_questions(conn)

    # Default admin
    from auth_utils import hash_password
    c.execute("SELECT id FROM users WHERE email=?", ("admin@mockmate.ai",))
    if not c.fetchone():
        c.execute('''INSERT INTO users (full_name, email, password_hash, role)
                     VALUES (?, ?, ?, ?)''',
                  ("Admin", "admin@mockmate.ai", hash_password("admin123"), "admin"))
        conn.commit()

    conn.close()
    print("Database initialized.")


def _seed_questions(conn):
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM questions")
    if c.fetchone()[0] > 0:
        return

    base = os.path.join(os.path.dirname(__file__), "..", "data")

    def safe_open(path):
        return open(path, encoding='utf-8-sig', errors='ignore')

    # HR Questions
    hr_path = os.path.join(base, "HR_Questions.csv")
    if os.path.exists(hr_path):
        with safe_open(hr_path) as f:
            for row in csv.DictReader(f):
                c.execute('''INSERT INTO questions (question, answer, category, subject, difficulty, question_type)
                             VALUES (?,?,?,?,?,?)''',
                          (row.get('Question',''), row.get('Example_Answer',''),
                           'HR', 'HR', row.get('Difficulty','Medium'), 'interview'))

    # Communication Questions
    comm_path = os.path.join(base, "Communication_Questions.csv")
    if os.path.exists(comm_path):
        with safe_open(comm_path) as f:
            for row in csv.DictReader(f):
                c.execute('''INSERT INTO questions (question, answer, category, subject, difficulty, question_type)
                             VALUES (?,?,?,?,?,?)''',
                          (row.get('Question',''), row.get('Example_Answer',''),
                           'Communication', 'Communication', row.get('Difficulty','Medium'), 'interview'))

    # Software Questions
    sw_path = os.path.join(base, "Software_Questions.csv")
    subject_map = {
        'Java': 'Java', 'Python': 'Python', 'C++': 'C/C++', 'JavaScript': 'Web Dev',
        'React': 'Web Dev', 'Node': 'Backend', 'SQL': 'Database', 'Database': 'Database',
        'DSA': 'DSA', 'Data Structure': 'DSA', 'Algorithm': 'DSA', 'System Design': 'System Design',
        'DevOps': 'DevOps', 'Docker': 'DevOps', 'Security': 'Security', 'Git': 'Backend',
        'REST': 'Backend', 'API': 'Backend', 'AWS': 'DevOps', 'Azure': 'DevOps',
        'General': 'General Programming', 'OOP': 'General Programming',
    }

    if os.path.exists(sw_path):
        with safe_open(sw_path) as f:
            for row in csv.DictReader(f):
                q = row.get('Question', row.get('question', ''))
                a = row.get('Answer', row.get('answer', ''))
                cat = row.get('Category', row.get('category', 'General Programming'))
                diff = row.get('Difficulty', row.get('difficulty', 'Medium'))

                subject = 'General Programming'
                for k, v in subject_map.items():
                    if k.lower() in cat.lower():
                        subject = v
                        break

                c.execute('''INSERT INTO questions (question, answer, category, subject, difficulty, question_type)
                             VALUES (?,?,?,?,?,?)''',
                          (q, a, 'Technical', subject, diff.capitalize(), 'interview'))

    # Full dataset
    full_path = os.path.join(base, "full_interview_questions_dataset.csv")
    if os.path.exists(full_path):
        with safe_open(full_path) as f:
            for row in csv.DictReader(f):
                q = row.get('question', '')
                cat_raw = row.get('category', 'Technical')
                diff = row.get('difficulty', 'medium').capitalize()

                subject = 'General Programming'
                for k, v in subject_map.items():
                    if k.lower() in q.lower():
                        subject = v
                        break

                if cat_raw.lower() in ['technical']:
                    category = 'Technical'
                elif cat_raw.lower() in ['hr', 'behavioral']:
                    category = 'HR'
                else:
                    category = 'Technical'

                c.execute('''INSERT INTO questions (question, category, subject, difficulty, question_type)
                             VALUES (?,?,?,?,?)''',
                          (q, category, subject, diff, 'interview'))

    conn.commit()
    print("Questions seeded.")