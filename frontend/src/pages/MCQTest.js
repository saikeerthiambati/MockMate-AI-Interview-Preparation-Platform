import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import API from '../utils/api';

export default function MCQTest() {
  const { subject } = useParams();
  const nav = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerReset, setTimerReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: qs } = await API.get(`/questions/mcq/${encodeURIComponent(subject)}`);
        setQuestions(qs);
        const { data: s } = await API.post('/interviews/start', {
          category: 'Technical', subject, session_type: 'mcq'
        });
        setSessionId(s.session_id);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [subject]);

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
  };

  const checkAnswer = useCallback(() => {
    if (!selected) return;
    setRevealed(true);
    const q = questions[current];
    const isCorrect = selected === q.correct_option;
    setResults(r => [...r, {
      question_id: q.id || current,
      question: q.question,
      is_correct: isCorrect,
      selected,
      correct: q.correct_option,
      explanation: q.explanation || q.answer || ''
    }]);
  }, [selected, questions, current]);

  const handleTimerExpire = useCallback(() => {
    if (!revealed) {
      setRevealed(true);
      const q = questions[current];
      setResults(r => [...r, {
        question_id: q.id || current,
        question: q.question,
        is_correct: false,
        selected: null,
        correct: q.correct_option,
        explanation: q.explanation || q.answer || ''
      }]);
    }
  }, [revealed, questions, current]);

  const nextQuestion = async () => {
    if (current + 1 >= questions.length) {
      try {
        await API.post('/interviews/finish', { session_id: sessionId, mcq_results: results });
      } catch (e) { console.error(e); }
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
      setTimerReset(r => r + 1);
    }
  };

  if (loading) return (
    <div className="page">
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
        <div className="spinner" />
      </div>
    </div>
  );

  // ── RESULTS PAGE ──
  if (finished) {
    const correct = results.filter(r => r.is_correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="page">
        <Navbar backTo={`/technical/${encodeURIComponent(subject)}/mode`} backLabel={subject} />
        <div className="page-narrow fade-in" style={{ paddingTop: 32 }}>
          {/* Score card */}
          <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 28 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>
              {pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: pct >= 70 ? 'var(--cyan)' : pct >= 50 ? 'var(--orange)' : 'var(--red)', marginBottom: 4 }}>
              {pct}%
            </div>
            <div style={{ color: 'var(--text2)', marginBottom: 8 }}>
              You scored <strong>{correct}</strong> out of <strong>{questions.length}</strong>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--orange)' : 'var(--red)' }}>
              {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : pct >= 40 ? 'Keep Practicing!' : 'Needs More Study'}
            </div>
          </div>

          {/* Per question review with explanations */}
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>📋 Question Review</h3>
          {results.map((r, i) => (
            <div key={i} className="card" style={{
              marginBottom: 14, padding: 20,
              borderLeft: `4px solid ${r.is_correct ? 'var(--green)' : 'var(--red)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                {r.is_correct
                  ? <CheckCircle size={18} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                  : <XCircle size={18} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />}
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                  Q{i + 1}: {r.question}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 13 }}>
                {r.selected && (
                  <div style={{ color: r.is_correct ? 'var(--green)' : 'var(--red)' }}>
                    Your answer: <strong>{r.selected}</strong>
                    {!r.is_correct && ' ✗'}
                  </div>
                )}
                {!r.is_correct && (
                  <div style={{ color: 'var(--green)' }}>
                    Correct: <strong>{r.correct}</strong> ✓
                  </div>
                )}
                {!r.selected && (
                  <div style={{ color: 'var(--orange)' }}>⏰ Time expired</div>
                )}
              </div>

              {/* Explanation */}
              {r.explanation && (
                <div style={{
                  background: 'rgba(0,212,170,0.07)',
                  border: '1px solid rgba(0,212,170,0.25)',
                  borderRadius: 8, padding: 12
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <BookOpen size={12} /> EXPLANATION
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                    {r.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => nav('/dashboard')}>Dashboard</button>
            <button className="btn btn-primary" onClick={() => nav('/analysis')}>View Analytics</button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION PAGE ──
  const q = questions[current];
  if (!q) return null;
  const opts = ['A', 'B', 'C', 'D'];
  const explanation = q.explanation || q.answer || '';

  return (
    <div className="page">
      {/* Top bar */}
      <div className="test-topbar">
        <div className="test-topbar-left">
          <button className="btn btn-secondary btn-sm"
            onClick={() => nav(`/technical/${encodeURIComponent(subject)}/mode`)}>
            ← Exit
          </button>
        </div>
        <span className="test-title">{subject} — MCQ</span>
        <div className="test-topbar-right">
          <button className="nav-icon-btn" onClick={() => setTimerEnabled(!timerEnabled)}>
            {timerEnabled
              ? <ToggleRight size={22} style={{ color: 'var(--cyan)' }} />
              : <ToggleLeft size={22} />}
          </button>
          {timerEnabled && (
            <Timer
              seconds={30}
              onExpire={handleTimerExpire}
              enabled={timerEnabled && !revealed}
              reset={timerReset}
            />
          )}
          <span style={{ color: 'var(--text2)', fontSize: 14 }}>{current + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: 'var(--border)' }}>
        <div style={{
          height: '100%', background: 'var(--grad)',
          width: `${(current / questions.length) * 100}%`,
          transition: 'width 0.3s'
        }} />
      </div>

      <div className="page-narrow fade-in" style={{ paddingTop: 32 }}>
        {/* Question */}
        <div className="question-card">
          <div className="question-label">QUESTION {current + 1}</div>
          <div className="question-text">{q.question}</div>
          {q.difficulty && (
            <span className={`badge badge-${q.difficulty.toLowerCase()}`}
              style={{ marginTop: 12, display: 'inline-flex' }}>
              {q.difficulty}
            </span>
          )}
        </div>

        {/* Options */}
        <div style={{ marginBottom: 16 }}>
          {opts.map(opt => {
            const text = q.options?.[opt];
            if (!text) return null;
            let cls = 'option-btn';
            if (revealed) {
              if (opt === q.correct_option) cls += ' correct';
              else if (opt === selected) cls += ' wrong';
            } else if (opt === selected) {
              cls += ' selected';
            }
            return (
              <button key={opt} className={cls} onClick={() => handleSelect(opt)} disabled={revealed}>
                <span className="option-letter">{opt}</span>
                {text}
                {revealed && opt === q.correct_option && (
                  <CheckCircle size={16} style={{ marginLeft: 'auto', color: 'var(--green)' }} />
                )}
                {revealed && opt === selected && opt !== q.correct_option && (
                  <XCircle size={16} style={{ marginLeft: 'auto', color: 'var(--red)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ✅ Correct Answer + Explanation shown after reveal */}
        {revealed && (
          <div className="fade-in" style={{ marginBottom: 20 }}>
            {/* Correct answer highlight */}
            <div style={{
              background: selected === q.correct_option
                ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${selected === q.correct_option ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 10, padding: 12, marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              {selected === q.correct_option
                ? <CheckCircle size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
                : <XCircle size={18} style={{ color: 'var(--red)', flexShrink: 0 }} />}
              <div style={{ fontSize: 14 }}>
                {selected === q.correct_option
                  ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>Correct! ✓</span>
                  : (
                    <span>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>Incorrect. </span>
                      <span style={{ color: 'var(--text2)' }}>
                        Correct answer: <strong style={{ color: 'var(--green)' }}>
                          {q.correct_option}. {q.options?.[q.correct_option]}
                        </strong>
                      </span>
                    </span>
                  )}
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <div style={{
                background: 'rgba(0,212,170,0.07)',
                border: '1px solid rgba(0,212,170,0.25)',
                borderRadius: 10, padding: 14
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={13} /> EXPLANATION
                </div>
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>
                  {explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!revealed ? (
            <button
              className="btn btn-primary"
              onClick={checkAnswer}
              disabled={!selected}
              style={{ minWidth: 140, justifyContent: 'center' }}>
              Check Answer
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={nextQuestion}
              style={{ minWidth: 140, justifyContent: 'center' }}>
              {current + 1 >= questions.length ? 'View Results →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}