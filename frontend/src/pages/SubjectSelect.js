import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SUBJECTS = [
  { key: 'Java', label: 'Java', emoji: '☕' },
  { key: 'Python', label: 'Python', emoji: '🐍' },
  { key: 'C/C++', label: 'C / C++', emoji: '⚡' },
  { key: 'DSA', label: 'DSA', emoji: '📊' },
  { key: 'Web Dev', label: 'Web Dev', emoji: '🌐' },
  { key: 'Backend', label: 'Backend', emoji: '🔧' },
  { key: 'Database', label: 'Database', emoji: '🗃️' },
  { key: 'System Design', label: 'System Design', emoji: '🏗️' },
  { key: 'DevOps', label: 'DevOps', emoji: '🚀' },
  { key: 'Security', label: 'Security', emoji: '🔒' },
];

export function SubjectSelect() {
  const nav = useNavigate();
  return (
    <div className="page">
      <Navbar title="Technical — Choose Subject" backTo="/dashboard" backLabel="Dashboard" />
      <div className="page-narrow">
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 32, paddingTop: 16 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Select a <span style={{ color: 'var(--cyan)' }}>Subject</span>
          </h2>
          <p style={{ color: 'var(--text2)' }}>Pick a domain to practice</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SUBJECTS.map(s => (
            <button
              key={s.key}
              onClick={() => nav('/technical/' + encodeURIComponent(s.key) + '/mode')}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 12, cursor: 'pointer',
                width: '100%', textAlign: 'left',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,212,170,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 26, width: 36, textAlign: 'center' }}>{s.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>MCQ • Coding • Mock Interview</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ModeSelect() {
  const nav = useNavigate();
  const subject = decodeURIComponent(window.location.pathname.split('/')[2]);
  const subjectEmojis = { 'Java': '☕', 'Python': '🐍', 'C/C++': '⚡', 'DSA': '📊', 'Web Dev': '🌐', 'Backend': '🔧', 'Database': '🗃️', 'System Design': '🏗️', 'DevOps': '🚀', 'Security': '🔒' };
  const emoji = subjectEmojis[subject] || '💡';

  const modes = [
    { key: 'mcq', emoji: '📝', title: 'MCQ Test', desc: '10 questions • 30 sec each • Instant feedback + explanation', color: 'var(--cyan)' },
    { key: 'coding', emoji: '💻', title: 'Coding Test', desc: '1 problem • 5 min • Optimal solution with complexity analysis', color: 'var(--purple2)' },
    { key: 'interview', emoji: '🤖', title: 'Mock Interview', desc: '5 questions • 1 min each • AI evaluated with model answers', color: 'var(--green)' },
  ];

  return (
    <div className="page">
      <Navbar title={subject + ' — Choose Mode'} backTo="/technical/subjects" backLabel="Subjects" />
      <div className="page-narrow fade-in" style={{ maxWidth: 520, paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{emoji}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--cyan)', marginBottom: 6 }}>{subject}</h2>
          <p style={{ color: 'var(--text2)' }}>Select your practice mode</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => nav('/technical/' + encodeURIComponent(subject) + '/' + m.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 24px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 14, cursor: 'pointer',
                width: '100%', textAlign: 'left',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = m.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: m.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {m.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--text)' }}>{m.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SubjectSelect;