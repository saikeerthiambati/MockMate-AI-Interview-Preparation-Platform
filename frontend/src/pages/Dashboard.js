import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API from '../utils/api';

const TIPS = [
  { title: 'Use the STAR method', desc: 'Situation → Task → Action → Result for clarity', color: 'var(--cyan)' },
  { title: 'Practice active listening', desc: 'Repeat or paraphrase the question before answering', color: 'var(--purple2)' },
  { title: 'Avoid filler words', desc: "Replace 'um', 'like' with brief pauses", color: 'var(--green)' },
  { title: 'Quantify achievements', desc: "Say 'reduced load time by 40%' not 'improved performance'", color: 'var(--blue)' },
  { title: 'Keep answers concise', desc: 'Aim for 1-2 minute responses', color: 'var(--orange)' },
  { title: 'Mirror professional tone', desc: "Match the interviewer's formality level", color: 'var(--cyan)' },
];

const RESOURCES = {
  Technical: [
    { name: 'LeetCode', url: 'https://leetcode.com', type: 'Platform', desc: 'Practice DSA problems' },
    { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', type: 'Platform', desc: 'CS fundamentals & interview questions' },
    { name: 'NeetCode', url: 'https://neetcode.io', type: 'Platform', desc: 'Guided coding interview roadmap' },
  ],
  'Behavioral / HR': [
    { name: 'STAR Method Guide', url: 'https://www.themuse.com/advice/star-interview-method', type: 'Article', desc: 'Structure behavioral answers effectively' },
    { name: 'Top 50 HR Questions', url: 'https://www.indiabix.com/hr-interview/questions-and-answers/', type: 'Article', desc: 'Most asked interview questions' },
    { name: 'Mock Interview Tips', url: 'https://www.indeed.com/career-advice/interviewing/mock-interview', type: 'Guide', desc: 'How to prepare for behavioral rounds' },
  ],
  'Communication Skills': [
    { name: 'TED Talks', url: 'https://www.ted.com/topics/communication', type: 'Video', desc: 'Learn from the best speakers' },
    { name: 'Toastmasters Tips', url: 'https://www.toastmasters.org/resources', type: 'Guide', desc: 'Improve speaking confidence' },
    { name: 'English Speaking Practice', url: 'https://www.englishclub.com/speaking/', type: 'Platform', desc: 'Daily practice for fluency' },
  ],
  'YouTube Channels': [
    { name: 'Striver (Take U forward)', url: 'https://www.youtube.com/@takeUforward', type: 'Channel', desc: 'DSA & competitive programming' },
    { name: 'Apna College', url: 'https://www.youtube.com/@ApnaCollegeOfficial', type: 'Channel', desc: 'Programming in Hindi' },
    { name: 'CareerVidz', url: 'https://www.youtube.com/@CareerVidz', type: 'Channel', desc: 'Interview questions & answers' },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState({ total_sessions: 0, avg_score: 0, best_verdict: '—' });

  useEffect(() => {
    API.get('/analytics/dashboard').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const categories = [
    { key: 'technical', icon: <Brain size={28} />, color: 'var(--cyan)', title: 'Technical', desc: 'Java, Python, C++, DSA, Web Dev, Backend, DB, DevOps & more', sub: 'MCQ • Coding • Interview →', onClick: () => nav('/technical/subjects') },
    { key: 'hr', icon: <Users size={28} />, color: 'var(--purple2)', title: 'HR', desc: 'Behavioral, situational, culture fit', sub: 'Mock Interview →', onClick: () => nav('/hr/interview') },
    { key: 'comm', icon: <MessageSquare size={28} />, color: 'var(--green)', title: 'Communication', desc: 'Presentation, clarity, articulation', sub: 'Mock Interview →', onClick: () => nav('/communication/interview') },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="fade-in">
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Welcome back, <span style={{ color: 'var(--cyan)' }}>{user?.full_name?.split(' ')[0]}</span>
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: 28 }}>Ready to ace your next interview?</p>

          <div className="grid-3" style={{ marginBottom: 32 }}>
            {[{ label: 'Interviews', value: stats.total_sessions }, { label: 'Avg Score', value: stats.avg_score > 0 ? stats.avg_score + '%' : '0%' }, { label: 'Best Verdict', value: stats.best_verdict }].map((s, i) => (
              <div key={i} className="card stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Choose a Category</h3>
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {categories.map(c => (
              <div key={c.key} className="card card-hover" onClick={c.onClick} style={{ padding: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{c.desc}</div>
                <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💡 Tips to Improve</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
            {TIPS.map((t, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: t.color }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📚 Learning Resources</h3>
          <div className="grid-2">
            {Object.entries(RESOURCES).map(([cat, items]) => (
              <div key={cat} className="card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'var(--cyan)' }}>
                  {cat === 'Technical' ? '💻' : cat === 'Behavioral / HR' ? '🧠' : cat === 'Communication Skills' ? '🗣️' : '📺'} {cat}
                </div>
                {items.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', color: 'inherit' }}>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}