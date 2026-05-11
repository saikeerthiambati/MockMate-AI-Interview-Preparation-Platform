import React, { useEffect, useState } from 'react';
import { Users, HelpCircle, BarChart2, Trash2, Plus, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import API from '../utils/api';

export default function AdminPage() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qFilter, setQFilter] = useState('');
  const [newQ, setNewQ] = useState({ question: '', answer: '', category: 'Technical', subject: 'Java', difficulty: 'Medium', question_type: 'interview' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => API.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  const loadUsers = () => { setLoading(true); API.get('/admin/users').then(r => { setUsers(r.data); setLoading(false); }); };
  const loadQuestions = (cat = '') => { setLoading(true); API.get(`/questions/all${cat ? `?category=${cat}` : ''}`).then(r => { setQuestions(r.data); setLoading(false); }); };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await API.delete(`/admin/users/${id}`);
    loadUsers();
  };

  const deleteQuestion = async (id) => {
    await API.delete(`/questions/${id}`);
    setQuestions(q => q.filter(x => x.id !== id));
  };

  const addQuestion = async () => {
    if (!newQ.question.trim()) return;
    try {
      await API.post('/questions/', newQ);
      setMsg('Question added!');
      setNewQ({ question: '', answer: '', category: 'Technical', subject: 'Java', difficulty: 'Medium', question_type: 'interview' });
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('Error adding question'); }
  };

  const tabs = [
    { key: 'stats', label: 'Overview', icon: <BarChart2 size={16} /> },
    { key: 'users', label: 'Users', icon: <Users size={16} /> },
    { key: 'questions', label: 'Questions', icon: <HelpCircle size={16} /> },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>Admin Panel</h2>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); if (t.key === 'users') loadUsers(); if (t.key === 'questions') loadQuestions(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: tab === t.key ? 'var(--card)' : 'transparent', color: tab === t.key ? 'var(--cyan)' : 'var(--text2)', borderBottom: tab === t.key ? '2px solid var(--cyan)' : '2px solid transparent', transition: 'all 0.2s' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'stats' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Total Students', value: stats.total_users, color: 'var(--cyan)' },
                  { label: 'Total Sessions', value: stats.total_sessions, color: 'var(--purple2)' },
                  { label: 'Total Questions', value: stats.total_questions, color: 'var(--green)' },
                  { label: 'Avg Score', value: `${stats.avg_score}%`, color: 'var(--orange)' },
                ].map((s, i) => (
                  <div key={i} className="card stat-card">
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Recent Activity</h3>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>User</th><th>Category</th><th>Type</th><th>Score</th><th>Date</th></tr></thead>
                  <tbody>
                    {stats.recent_sessions?.map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                        <td><span className={`badge badge-${s.category?.toLowerCase() === 'technical' ? 'easy' : s.category?.toLowerCase() === 'hr' ? 'medium' : 'hard'}`}>{s.category}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--text2)' }}>{s.session_type}</td>
                        <td style={{ fontWeight: 700, color: 'var(--cyan)' }}>{s.score}%</td>
                        <td style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 700 }}>All Users ({users.length})</h3>
                <button className="btn btn-secondary btn-sm" onClick={loadUsers}><RefreshCw size={14} /></button>
              </div>
              {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>College</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{u.id}</td>
                          <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                          <td style={{ color: 'var(--text2)', fontSize: 13 }}>{u.email}</td>
                          <td style={{ color: 'var(--text2)', fontSize: 13 }}>{u.college_name || '—'}</td>
                          <td><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: u.role === 'admin' ? 'rgba(124,92,191,0.2)' : 'var(--border)', color: u.role === 'admin' ? 'var(--purple2)' : 'var(--text2)', fontWeight: 600 }}>{u.role}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>{u.role !== 'admin' && <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}><Trash2 size={13} /></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          {tab === 'questions' && (
            <div>
              {/* Add question form */}
              <div className="card" style={{ marginBottom: 20, padding: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add New Question</h3>
                {msg && <div style={{ background: msg.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${msg.includes('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: msg.includes('Error') ? 'var(--red)' : 'var(--green)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13 }}>{msg}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <select className="input" value={newQ.category} onChange={e => setNewQ({ ...newQ, category: e.target.value })} style={{ appearance: 'none' }}>
                    <option>Technical</option><option>HR</option><option>Communication</option>
                  </select>
                  <select className="input" value={newQ.subject} onChange={e => setNewQ({ ...newQ, subject: e.target.value })} style={{ appearance: 'none' }}>
                    {['Java','Python','C/C++','DSA','Web Dev','Backend','Database','System Design','DevOps','Security','General Programming'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select className="input" value={newQ.difficulty} onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })} style={{ appearance: 'none' }}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                  <select className="input" value={newQ.question_type} onChange={e => setNewQ({ ...newQ, question_type: e.target.value })} style={{ appearance: 'none' }}>
                    <option value="interview">Interview</option>
                  </select>
                </div>
                <textarea className="input" style={{ minHeight: 60, marginBottom: 10 }} placeholder="Question text..." value={newQ.question} onChange={e => setNewQ({ ...newQ, question: e.target.value })} />
                <textarea className="input" style={{ minHeight: 60, marginBottom: 12 }} placeholder="Reference answer (optional)..." value={newQ.answer} onChange={e => setNewQ({ ...newQ, answer: e.target.value })} />
                <button className="btn btn-primary" onClick={addQuestion}><Plus size={16} /> Add Question</button>
              </div>

              {/* Filter + list */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700 }}>All Questions ({questions.length})</h3>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {['', 'Technical', 'HR', 'Communication'].map(cat => (
                    <button key={cat} onClick={() => { setQFilter(cat); loadQuestions(cat); }} className={`btn btn-sm ${qFilter === cat ? 'btn-primary' : 'btn-secondary'}`}>
                      {cat || 'All'}
                    </button>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => loadQuestions(qFilter)}><RefreshCw size={14} /></button>
                </div>
              </div>
              {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table>
                    <thead><tr><th>ID</th><th>Question</th><th>Category</th><th>Subject</th><th>Difficulty</th><th>Action</th></tr></thead>
                    <tbody>
                      {questions.slice(0, 100).map(q => (
                        <tr key={q.id}>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{q.id}</td>
                          <td style={{ maxWidth: 400, fontSize: 13, color: 'var(--text2)' }}>{q.question?.substring(0, 80)}{q.question?.length > 80 ? '...' : ''}</td>
                          <td><span className={`badge badge-${q.category?.toLowerCase() === 'technical' ? 'easy' : q.category?.toLowerCase() === 'hr' ? 'medium' : 'hard'}`}>{q.category}</span></td>
                          <td style={{ fontSize: 13, color: 'var(--text2)' }}>{q.subject}</td>
                          <td><span className={`badge badge-${(q.difficulty || '').toLowerCase()}`}>{q.difficulty}</span></td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(q.id)}><Trash2 size={13} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {questions.length > 100 && <div style={{ padding: 12, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Showing first 100 of {questions.length} questions</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
