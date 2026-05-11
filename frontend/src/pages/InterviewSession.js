import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Type, Brain, ToggleLeft, ToggleRight, ChevronRight, SkipForward, AlertCircle, CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import API from '../utils/api';

export default function InterviewSession({ category: propCategory }) {
  const { subject } = useParams();
  const nav = useNavigate();
  const category = propCategory || 'Technical';

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState('text');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerReset, setTimerReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [finished, setFinished] = useState(false);
  const [finalData, setFinalData] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const params = category === 'Technical'
          ? `/questions/interview/${category}?subject=${encodeURIComponent(subject)}&count=5`
          : `/questions/interview/${category}?count=5`;
        const { data: qs } = await API.get(params);
        setQuestions(qs);
        const { data: s } = await API.post('/interviews/start', {
          category, subject: subject || category, session_type: 'interview'
        });
        setSessionId(s.session_id);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
    return () => recognitionRef.current?.stop();
  }, [category, subject]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech Recognition not supported. Please use Chrome.'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      setAnswer(t);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const submitAndEvaluate = useCallback(async () => {
    const q = questions[current];
    if (!q) return;
    const userAnswer = answer.trim();
    setCurrentQuestion(q);
    setEvaluating(true);
    try {
      const result = await API.post('/interviews/submit-answer', {
        session_id: sessionId,
        question_id: q.id || current + 1,
        question_text: q.question,
        user_answer: userAnswer || '(No answer provided)',
        reference_answer: q.answer || '',
      });
      setFeedback({ ...result.data, referenceAnswer: q.answer || '' });
      setAllFeedback(f => [...f, { ...result.data, question: q.question, referenceAnswer: q.answer || '' }]);
    } catch (e) {
      const score = userAnswer.length > 50 ? 65 : userAnswer.length > 20 ? 45 : 20;
      const fb = {
        overall_score: score, verdict: score > 60 ? 'Average' : 'Poor',
        similarity_score: score, concept_clarity: score, communication_score: score,
        areas_to_improve: ['Provide more detail'], suggestions: ['Elaborate your answer'],
        what_to_add: [], referenceAnswer: q.answer || ''
      };
      setFeedback(fb);
      setAllFeedback(f => [...f, { ...fb, question: q.question }]);
    }
    setEvaluating(false);
  }, [questions, current, answer, sessionId]);

  const nextQuestion = async () => {
    if (current + 1 >= questions.length) {
      try {
        const { data } = await API.post('/interviews/finish', { session_id: sessionId });
        setFinalData(data);
      } catch (e) {
        setFinalData({ score: 0, verdict: 'Poor', suggestions: { suggestions: [] } });
      }
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setAnswer('');
      setTranscript('');
      setFeedback(null);
      setCurrentQuestion(null);
      setTimerReset(r => r + 1);
      setListening(false);
    }
  };

  const skip = () => {
    setAnswer('(Skipped)');
    setTimeout(() => submitAndEvaluate(), 100);
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
  if (finished && finalData) {
    const avgScore = finalData.score ||
      (allFeedback.reduce((s, f) => s + (f.overall_score || 0), 0) / (allFeedback.length || 1));
    const verdict = finalData.verdict || 'Average';

    return (
      <div className="page">
        <Navbar backTo="/dashboard" backLabel="Dashboard" />
        <div className="page-narrow" style={{ paddingTop: 32 }}>
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>
              {category} Interview — Results
            </h2>

            {/* Overall score */}
            <div className="card" style={{ textAlign: 'center', marginBottom: 24, padding: 36 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: avgScore >= 70 ? 'var(--cyan)' : avgScore >= 50 ? 'var(--orange)' : 'var(--red)', marginBottom: 4 }}>
                {Math.round(avgScore)}%
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: avgScore >= 70 ? 'var(--green)' : avgScore >= 50 ? 'var(--orange)' : 'var(--red)', marginBottom: 4 }}>
                {verdict}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 14 }}>Overall Interview Score</div>
            </div>

            {/* Per-question breakdown with model answers */}
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Question-by-Question Breakdown</h3>
            {allFeedback.map((f, i) => (
              <div key={i} className="card" style={{ marginBottom: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: 'var(--text)' }}>
                  Q{i + 1}: {f.question}
                </div>

                {/* Score bars */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[['Similarity', f.similarity_score], ['Clarity', f.concept_clarity], ['Communication', f.communication_score]].map(([l, v]) => (
                    <div key={l} style={{ minWidth: 100 }}>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{l}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="score-bar-wrap">
                          <div className="score-bar-fill" style={{ width: `${v}%`, background: v >= 70 ? 'var(--green)' : v >= 50 ? 'var(--orange)' : 'var(--red)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{Math.round(v)}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Model Answer */}
                {f.referenceAnswer && (
                  <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BookOpen size={13} /> MODEL ANSWER
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{f.referenceAnswer}</div>
                  </div>
                )}

                {/* Suggestions */}
                {f.suggestions?.length > 0 && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 6 }}>
                    <span style={{ color: 'var(--cyan)' }}>💡</span> {f.suggestions[0]}
                  </div>
                )}
              </div>
            ))}

            {/* Recommendations */}
            {finalData.suggestions?.suggestions?.length > 0 && (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 14, marginTop: 24 }}>Personalized Recommendations</h3>
                <div className="card" style={{ padding: 20 }}>
                  {finalData.suggestions.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < finalData.suggestions.suggestions.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14, color: 'var(--text2)' }}>
                      <TrendingUp size={14} style={{ color: 'var(--cyan)', marginTop: 2, flexShrink: 0 }} />
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => nav('/dashboard')}>Dashboard</button>
              <button className="btn btn-primary" onClick={() => nav('/analysis')}>View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="page">
      {/* Top bar */}
      <div className="test-topbar">
        <div className="test-topbar-left">
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/dashboard')}>← Dashboard</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={18} style={{ color: 'var(--cyan)' }} />
          <span className="test-title">
            {category === 'Technical' ? `${subject} Interview` : `${category} Interview`}
          </span>
        </div>
        <div className="test-topbar-right">
          <button className="nav-icon-btn" onClick={() => setTimerEnabled(!timerEnabled)}>
            {timerEnabled ? <ToggleRight size={22} style={{ color: 'var(--cyan)' }} /> : <ToggleLeft size={22} />}
          </button>
          {timerEnabled && !feedback && (
            <Timer seconds={60} onExpire={submitAndEvaluate} enabled={timerEnabled && !feedback && !evaluating} reset={timerReset} />
          )}
          <span style={{ color: 'var(--text2)', fontSize: 14 }}>Progress {current}/{questions.length}</span>
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ padding: '8px 24px 0', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: i < current ? 'var(--cyan)' : 'var(--border)', borderRadius: 2 }}>
              {i === current && (
                <div style={{ height: '100%', background: 'var(--grad)', borderRadius: 2, width: feedback ? '100%' : '50%', transition: 'width 0.3s' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', paddingBottom: 6 }}>
          <span>Question {current + 1}</span>
          <span>{Math.round((current / questions.length) * 100)}% Complete</span>
        </div>
      </div>

      <div className="page-narrow fade-in" style={{ paddingTop: 24 }}>
        {/* Question */}
        <div className="question-card" style={{ marginBottom: 20, border: '1px solid var(--cyan)', background: 'rgba(0,212,170,0.04)' }}>
          <div className="question-label">
            <Brain size={12} style={{ display: 'inline', marginRight: 4 }} />
            QUESTION {current + 1} OF {questions.length}
          </div>
          <div className="question-text" style={{ fontSize: 20 }}>{q.question}</div>
        </div>

        {/* ── FEEDBACK PANEL (shown after submit) ── */}
        {feedback ? (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16, padding: 24, border: `1px solid ${feedback.overall_score >= 70 ? 'var(--green)' : feedback.overall_score >= 50 ? 'var(--orange)' : 'var(--red)'}` }}>

              {/* Score header */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>
                  {feedback.overall_score >= 80
                    ? <CheckCircle size={40} style={{ color: 'var(--green)' }} />
                    : feedback.overall_score >= 50
                    ? <AlertCircle size={40} style={{ color: 'var(--orange)' }} />
                    : <XCircle size={40} style={{ color: 'var(--red)' }} />}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: feedback.overall_score >= 70 ? 'var(--green)' : feedback.overall_score >= 50 ? 'var(--orange)' : 'var(--red)' }}>
                  {feedback.verdict}
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                  Overall Score: {Math.round(feedback.overall_score)}%
                </div>
              </div>

              {/* Score breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[['Similarity', feedback.similarity_score, 'var(--cyan)'], ['Concept Clarity', feedback.concept_clarity, 'var(--orange)'], ['Communication', feedback.communication_score, 'var(--purple2)']].map(([l, v, c]) => (
                  <div key={l} style={{ background: 'var(--bg2)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{Math.round(v)}%</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{l}</div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: c, width: `${v}%`, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ MODEL ANSWER - Correct answer with explanation */}
              {feedback.referenceAnswer && (
                <div style={{ background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={14} /> ✅ MODEL ANSWER / CORRECT EXPLANATION
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8 }}>
                    {feedback.referenceAnswer}
                  </div>
                </div>
              )}

              {/* Areas + Suggestions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {feedback.areas_to_improve?.length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>⚠ Areas to Improve</div>
                    {feedback.areas_to_improve.map((a, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--text2)', padding: '4px 0', display: 'flex', gap: 6 }}>
                        <span style={{ color: 'var(--red)' }}>•</span>{a}
                      </div>
                    ))}
                  </div>
                )}
                {feedback.suggestions?.length > 0 && (
                  <div style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 8 }}>💡 Suggestions</div>
                    {feedback.suggestions.map((s, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--text2)', padding: '4px 0', display: 'flex', gap: 6 }}>
                        <span style={{ color: 'var(--cyan)' }}>•</span>{s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* What to add */}
              {feedback.what_to_add?.length > 0 && (
                <div style={{ marginTop: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple2)', marginBottom: 8 }}>✨ What You Could Add</div>
                  {feedback.what_to_add.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text2)', padding: '3px 0' }}>• {w}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={nextQuestion} style={{ minWidth: 160, justifyContent: 'center' }}>
                {current + 1 >= questions.length ? 'View Results' : 'Next Question'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Answer mode tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => { setMode('text'); stopListening(); }} className={`btn btn-sm ${mode === 'text' ? 'btn-primary' : 'btn-secondary'}`}>
                <Type size={14} /> Type Answer
              </button>
              <button onClick={() => { setMode('voice'); }} className={`btn btn-sm ${mode === 'voice' ? 'btn-primary' : 'btn-secondary'}`}>
                <Mic size={14} /> Voice Answer
              </button>
            </div>

            {mode === 'text' ? (
              <textarea
                className="input"
                style={{ minHeight: 160, marginBottom: 16, lineHeight: 1.7 }}
                placeholder="Share your thoughts... Be detailed and structured in your response."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
              />
            ) : (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 32, textAlign: 'center', marginBottom: 16 }}>
                <button onClick={listening ? stopListening : startListening} className="voice-btn" style={{ margin: '0 auto 16px' }}>
                  {listening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
                <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 12 }}>
                  {listening ? 'Listening... tap to stop' : 'Tap the microphone to begin'}
                </div>
                {listening && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Speak clearly for best results</div>}
                {transcript && (
                  <div style={{ marginTop: 16, background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 14, textAlign: 'left' }}>
                    <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, marginBottom: 6 }}>● LIVE TRANSCRIPT</div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{transcript}</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={skip}>
                <SkipForward size={15} /> Skip Question
              </button>
              <button
                className="btn btn-primary"
                style={{ minWidth: 160, justifyContent: 'center' }}
                onClick={submitAndEvaluate}
                disabled={evaluating || (!answer.trim() && mode === 'text')}
              >
                {evaluating
                  ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Evaluating...</>
                  : <><Brain size={15} /> Submit & Evaluate</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}