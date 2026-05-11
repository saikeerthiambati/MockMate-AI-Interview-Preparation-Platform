import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mic, BarChart2, Layers, ChevronRight, Users, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    { icon: <Brain size={22} />, title: 'AI Evaluation', desc: 'Deep learning powered answer analysis with semantic similarity scoring', color: 'var(--cyan)' },
    { icon: <Mic size={22} />, title: 'Voice Support', desc: 'Practice with voice answers for a realistic interview experience', color: 'var(--purple2)' },
    { icon: <BarChart2 size={22} />, title: 'Performance Analytics', desc: 'Track your progress with detailed charts and personalized insights', color: 'var(--blue)' },
    { icon: <Layers size={22} />, title: 'Multi-Category', desc: 'Technical, HR and Communication interview preparation', color: 'var(--green)' },
  ];

  const steps = [
    { num: '01', icon: <Layers size={24} />, title: 'Choose Category', desc: 'Select Technical, HR or Communication interview type' },
    { num: '02', icon: <Code size={24} />, title: 'Answer Questions', desc: 'Type or speak your answers in a realistic interview setting' },
    { num: '03', icon: <BarChart2 size={24} />, title: 'Get AI Feedback', desc: 'Receive detailed analysis with scores and improvement tips' },
  ];

  return (
    <div className="page">
      <Navbar />
      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div className="fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid var(--border2)', background: 'rgba(0,212,170,0.08)', color: 'var(--cyan)', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <Brain size={14} /> AI-Powered Interview Preparation
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Ace Your Next<br />
            <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 32 }}>
            Practice with AI-driven mock interviews. Get instant semantic analysis, personalized feedback, and track your improvement over time.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
              Start Practicing <ChevronRight size={18} />
            </Link>
            {!user && <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>}
          </div>
        </div>

        {/* Mock session preview */}
        <div className="fade-in" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00d4aa' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7c5cbf' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--border2)' }} />
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.1em' }}>MOCK SESSION</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} style={{ color: 'var(--cyan)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>AI Interviewer</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Analyzing responses...</div>
            </div>
          </div>
          <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 14 }}>
            "Explain the difference between REST and GraphQL?"
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontSize: 13, color: 'var(--text3)' }}>
            Candidate typing...
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
            Live feedback enabled
          </div>
          {/* Floating score badge */}
          <div style={{ position: 'absolute', top: -16, right: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} style={{ color: 'var(--cyan)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>95% Score</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Top performer</div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text3)' }}>
              <Brain size={14} style={{ color: 'var(--purple2)' }} />
              <span style={{ color: 'var(--purple2)', fontWeight: 600 }}>AI Evaluation</span> · Real-time feedback
            </div>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Score: 87%</span>
          </div>
        </div>
      </section>

      {/* Why MockMate */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Why MockMate AI?</h2>
          <p style={{ color: 'var(--text2)', fontSize: 16 }}>Everything you need to prepare for your dream job interview</p>
        </div>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 14 }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Community & stats */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 600, marginBottom: 8 }}>Community</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Join Thousands of Job Seekers</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Prepare with HR, communication, and technical interviews. Covering 10+ domains from Backend to DevOps.</p>
          </div>
          <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
            {[['1,200+', 'Students'], ['10+', 'Domains'], ['500+', 'Questions']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cyan)' }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 40 }}>How It Works</h2>
        <div className="grid-3">
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ padding: 32 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--cyan)', opacity: 0.4, marginBottom: 16 }}>{s.num}</div>
              <div style={{ color: 'var(--cyan)', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</div>
              <div style={{ color: 'var(--text3)', fontSize: 14 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            Get Started Free <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
