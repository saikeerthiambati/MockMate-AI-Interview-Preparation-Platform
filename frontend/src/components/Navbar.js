import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, BarChart2, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ title, backTo, backLabel }) {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {backTo ? (
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(backTo)}>
            ← {backLabel || 'Back'}
          </button>
        ) : (
          <Link to="/" className="nav-logo">MockMate AI</Link>
        )}
        {title && (
          <span style={{ color: 'var(--cyan)', fontSize: 15, fontWeight: 600 }}>
            {title}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="nav-actions">
        {/* Analysis link */}
        {user && (
          <Link to="/analysis" className="nav-icon-btn" title="Analysis">
            <BarChart2 size={16} />
            <span style={{ fontSize: 13 }}>Analysis</span>
          </Link>
        )}

        {/* Dark/Light toggle */}
        <button
          className="nav-icon-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span style={{ fontSize: 13 }}>{darkMode ? 'Light' : 'Dark'}</span>
        </button>

        {user && (
          <>
            {/* Username */}
            <span className="nav-user-name">{user.full_name}</span>

            {/* Admin link */}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="nav-icon-btn"
                style={{ color: 'var(--purple2)', borderColor: 'var(--purple)' }}
              >
                <ShieldCheck size={16} />
                <span style={{ fontSize: 13 }}>Admin</span>
              </Link>
            )}

            {/* Logout */}
            <button className="nav-icon-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
              <span style={{ fontSize: 13 }}>Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
