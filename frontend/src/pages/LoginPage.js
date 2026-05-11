import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      nav(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <Brain size={28} style={{ color: 'var(--cyan)' }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MockMate AI</h1>
          </div>
          <p style={{ color: 'var(--text2)' }}>Sign in to your account</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <div className="input-group">
            <Mail size={16} className="input-icon" />
            <input className="input input-with-icon" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock size={16} className="input-icon" />
            <input className="input input-with-icon" style={{ paddingRight: 42 }} type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && submit()} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={submit} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', college_name: '', year_of_study: 1, graduation_year: 2026, email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <Brain size={28} style={{ color: 'var(--cyan)' }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MockMate AI</h1>
          </div>
          <p style={{ color: 'var(--text2)' }}>Create your account</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <input className="input" placeholder="Full Name" style={{ marginBottom: 14 }} value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          <input className="input" placeholder="College Name" style={{ marginBottom: 14 }} value={form.college_name} onChange={e => set('college_name', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Year of Study</label>
              <select className="input" value={form.year_of_study} onChange={e => set('year_of_study', parseInt(e.target.value))} style={{ appearance: 'none' }}>
                {[1,2,3,4].map(y => <option key={y} value={y}>{y}{y===1?'st':y===2?'nd':y===3?'rd':'th'} Year</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Graduation Year</label>
              <select className="input" value={form.graduation_year} onChange={e => set('graduation_year', parseInt(e.target.value))} style={{ appearance: 'none' }}>
                {[2025,2026,2027,2028,2029].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <input className="input" type="email" placeholder="Email Address" style={{ marginBottom: 14 }} value={form.email} onChange={e => set('email', e.target.value)} />
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input className="input" type={showPw ? 'text' : 'password'} placeholder="Password" style={{ paddingRight: 42 }} value={form.password} onChange={e => set('password', e.target.value)} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submit} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
