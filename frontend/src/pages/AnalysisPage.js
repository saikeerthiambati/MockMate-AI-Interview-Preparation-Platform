import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ExternalLink, TrendingUp, Award, BarChart2, Brain, Users, MessageSquare, Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import API from '../utils/api';

const RESOURCES = {
  Technical: [
    { name: 'LeetCode', url: 'https://leetcode.com', type: 'Platform', desc: 'Practice DSA problems' },
    { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', type: 'Platform', desc: 'CS fundamentals' },
    { name: 'NeetCode', url: 'https://neetcode.io', type: 'Platform', desc: 'Guided coding roadmap' },
    { name: 'Striver', url: 'https://takeuforward.org', type: 'Channel', desc: 'DSA & CP' },
    { name: 'Apna College', url: 'https://www.youtube.com/@ApnaCollegeOfficial', type: 'Channel', desc: 'Programming Hindi' },
  ],
  HR: [
    { name: 'STAR Method Guide', url: 'https://www.themuse.com/advice/star-interview-method', type: 'Article', desc: 'Structure behavioral answers' },
    { name: 'Top 50 HR Questions', url: 'https://www.indiabix.com/hr-interview/questions-and-answers/', type: 'Article', desc: 'Most asked HR questions' },
    { name: 'Mock Interview Tips', url: 'https://www.indeed.com/career-advice/interviewing/mock-interview', type: 'Guide', desc: 'Behavioral round prep' },
    { name: 'CareerVidz', url: 'https://www.youtube.com/@CareerVidz', type: 'Channel', desc: 'Interview Q&A' },
  ],
  Communication: [
    { name: 'TED Talks', url: 'https://www.ted.com/topics/communication', type: 'Video', desc: 'Learn from best speakers' },
    { name: 'Toastmasters', url: 'https://www.toastmasters.org/resources', type: 'Guide', desc: 'Speaking confidence' },
    { name: 'English Speaking Practice', url: 'https://www.englishclub.com/speaking/', type: 'Platform', desc: 'Daily fluency practice' },
    { name: 'Communication - Coursera', url: 'https://www.coursera.org/courses?query=communication+skills', type: 'Course', desc: 'Structured courses' },
  ],
};

function ResourceList({ category }) {
  const items = RESOURCES[category] || [];
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'var(--cyan)' }}>
        {category === 'Technical' ? '💻' : category === 'HR' ? '🧠' : '🗣️'} {category} Resources
      </div>
      {items.map((r, i) => (
        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.desc}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--border)', color: 'var(--text3)' }}>{r.type}</span>
            <ExternalLink size={14} style={{ color: 'var(--text3)' }} />
          </div>
        </a>
      ))}
    </div>
  );
}

function CategoryTab({ data, category, color, icon }) {
  const catData = data?.performance_by_category?.[category];
  const sessions = catData?.sessions || [];
  const trend = data?.score_trend?.filter(s => s.category === category) || [];

  if (!catData || catData.total_sessions === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {category === 'Technical' ? '💻' : category === 'HR' ? '🧠' : '🗣️'}
        </div>
        <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No {category} Sessions Yet</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Complete a {category} interview to see your performance analysis here.
        </p>
      </div>
    );
  }

  const avg = catData.avg_score;
  const best = catData.best_score;
  const total = catData.total_sessions;

  return (
    <div>
      {/* Category stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Avg Score', value: avg + '%', color },
          { label: 'Best Score', value: best + '%', color: 'var(--green)' },
          { label: 'Sessions', value: total, color: 'var(--purple2)' },
        ].map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{category} Performance</span>
          <span style={{ fontWeight: 700, color }}>{avg}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: avg + '%', background: color, borderRadius: 5, transition: 'width 1s ease' }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text3)' }}>
          {avg >= 80 ? '🏆 Excellent performance!' : avg >= 65 ? '👍 Good performance' : avg >= 50 ? '📈 Average - keep practicing' : '📚 Needs improvement'}
        </div>
      </div>

      {/* Trend chart */}
      {sessions.length > 1 && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessions.map((s, i) => ({ session: i + 1, score: s.score }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="session" tick={{ fill: 'var(--text3)', fontSize: 12 }} label={{ value: 'Session', position: 'insideBottom', fill: 'var(--text3)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Past sessions table */}
      <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Past Sessions</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>Subject / Type</th>
              <th>Session Type</th>
              <th>Score</th>
              <th>Verdict</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={i}>
                <td style={{ color, fontWeight: 600 }}>{s.subject || category}</td>
                <td>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'var(--border)', color: 'var(--text2)' }}>
                    {s.session_type || 'interview'}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{s.score}%</td>
                <td>
                  <span style={{ fontWeight: 600, fontSize: 13, color: s.verdict === 'Excellent' ? 'var(--cyan)' : s.verdict === 'Good' ? 'var(--green)' : s.verdict === 'Poor' ? 'var(--red)' : 'var(--orange)' }}>
                    {s.verdict}
                  </span>
                </td>
                <td style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resources */}
      <ResourceList category={category} />
    </div>
  );
}

export default function AnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const nav = useNavigate();

  useEffect(() => {
    API.get('/analytics/performance').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
        <div className="spinner" />
      </div>
    </div>
  );

  const tabs = [
    { key: 'overall', label: 'Overall', icon: <BarChart2 size={15} /> },
    { key: 'Technical', label: 'Technical', icon: <Brain size={15} /> },
    { key: 'HR', label: 'HR', icon: <Users size={15} /> },
    { key: 'Communication', label: 'Communication', icon: <MessageSquare size={15} /> },
  ];

  const catColors = { Technical: 'var(--cyan)', HR: 'var(--purple2)', Communication: 'var(--green)' };
  const overall = data?.overall_avg || 0;
  const level = data?.level || 'Beginner';
  const levelColor = { Expert: 'var(--cyan)', Intermediate: 'var(--green)', Beginner: 'var(--orange)', Novice: 'var(--red)' }[level] || 'var(--orange)';
  const catData = data?.performance_by_category || {};

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="fade-in">

          {/* Header with back button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>Performance Analytics</h2>
            <button className="btn btn-secondary" onClick={() => nav('/dashboard')}>
              <Home size={16} /> Dashboard
            </button>
          </div>

          {/* Tab navigation */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'var(--card)', borderRadius: 12, padding: 6, border: '1px solid var(--border)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  background: activeTab === t.key ? 'var(--grad)' : 'transparent',
                  color: activeTab === t.key ? '#fff' : 'var(--text2)',
                  transition: 'all 0.2s',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERALL TAB ── */}
          {activeTab === 'overall' && (
            <div>
              {/* Top stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Avg Score', value: overall + '%', color: 'var(--cyan)', icon: <BarChart2 size={18} /> },
                  { label: 'Best Score', value: Math.max(...Object.values(catData).map(c => c.best_score || 0), 0) + '%', color: 'var(--green)', icon: <Award size={18} /> },
                  { label: 'Level', value: level, color: levelColor, icon: <TrendingUp size={18} /> },
                  { label: 'Total Sessions', value: data?.total_sessions || 0, color: 'var(--purple2)', icon: <BarChart2 size={18} /> },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Performance by Category</h3>
                  {Object.entries(catData).length === 0 ? (
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>No sessions completed yet.</p>
                  ) : (
                    Object.entries(catData).map(([cat, cd]) => (
                      <div key={cat} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{cat}</span>
                          <span style={{ fontWeight: 700, color: catColors[cat] || 'var(--cyan)' }}>{cd.avg_score}%</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: catColors[cat] || 'var(--cyan)', width: cd.avg_score + '%', borderRadius: 4, transition: 'width 1s ease' }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{cd.total_sessions} session{cd.total_sessions !== 1 ? 's' : ''}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Score trend */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Improvement Trend</h3>
                  {(data?.score_trend?.length || 0) > 1 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data.score_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="session" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                        <Line type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={2} dot={{ fill: 'var(--cyan)', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>
                      Complete more sessions to see trend
                    </div>
                  )}
                </div>
              </div>

              {/* Weak areas + recommendations */}
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--red)' }}>⚠ Top Weak Areas</h3>
                  {(data?.weak_areas || []).length > 0 ? data.weak_areas.map((w, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.weak_areas.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14 }}>
                      <span style={{ color: 'var(--text2)' }}>{w.area}</span>
                      <span style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>×{w.count}</span>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>No weak areas yet. Keep practicing!</p>
                  )}
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--cyan)' }}>💡 Recommendations</h3>
                  {(data?.suggestions || []).length > 0 ? data.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < data.suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <TrendingUp size={14} style={{ color: 'var(--cyan)', marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{s}</span>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>Complete more interviews for recommendations.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TECHNICAL TAB ── */}
          {activeTab === 'Technical' && (
            <CategoryTab data={data} category="Technical" color="var(--cyan)" icon={<Brain />} />
          )}

          {/* ── HR TAB ── */}
          {activeTab === 'HR' && (
            <CategoryTab data={data} category="HR" color="var(--purple2)" icon={<Users />} />
          )}

          {/* ── COMMUNICATION TAB ── */}
          {activeTab === 'Communication' && (
            <CategoryTab data={data} category="Communication" color="var(--green)" icon={<MessageSquare />} />
          )}

        </div>
      </div>
    </div>
  );
}