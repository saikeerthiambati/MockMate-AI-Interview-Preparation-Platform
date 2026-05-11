import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function StreakCard() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/streak/')
      .then(r => { setStreak(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card" style={{ padding: 20, marginBottom: 24 }}>
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  );

  if (!streak) return null;

  const { current_streak, longest_streak, practiced_today, streak_dates, total_days } = streak;

  // Streak fire color based on streak count
  const fireColor = current_streak >= 30 ? '#ff4500'
    : current_streak >= 14 ? '#ff6b00'
    : current_streak >= 7  ? '#ff9500'
    : current_streak >= 3  ? '#ffb800'
    : '#ffd000';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card" style={{
      padding: 20,
      marginBottom: 24,
      background: 'var(--card)',
      border: `1px solid ${practiced_today ? 'rgba(255,150,0,0.4)' : 'var(--border)'}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow effect if on streak */}
      {current_streak > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${fireColor}, transparent)`,
          opacity: 0.8
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>

        {/* Left - Main streak display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Fire emoji with animation */}
          <div style={{
            fontSize: 44,
            lineHeight: 1,
            filter: current_streak === 0 ? 'grayscale(1) opacity(0.4)' : 'none',
            animation: current_streak > 0 ? 'flamePulse 1.5s ease-in-out infinite' : 'none',
          }}>
            🔥
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontSize: 40, fontWeight: 900,
                color: current_streak > 0 ? fireColor : 'var(--text3)',
                lineHeight: 1
              }}>
                {current_streak}
              </span>
              <span style={{ fontSize: 16, color: 'var(--text2)', fontWeight: 600 }}>
                day{current_streak !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
              Current Streak
            </div>
            {/* Today status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 6, padding: '3px 10px', borderRadius: 20,
              background: practiced_today ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${practiced_today ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              fontSize: 12, fontWeight: 600,
              color: practiced_today ? 'var(--green)' : 'var(--orange)'
            }}>
              <span>{practiced_today ? '✓' : '!'}</span>
              {practiced_today ? 'Practiced today!' : 'Practice today to keep streak!'}
            </div>
          </div>
        </div>

        {/* Right - Stats */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>
              {longest_streak}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>🏆 Best</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--purple2)' }}>
              {total_days}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>📅 Total Days</div>
          </div>
        </div>
      </div>

      {/* 7-day calendar */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Last 7 Days
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {streak_dates && streak_dates.map((d, i) => {
            const dayLabel = days[new Date(d.date + 'T00:00:00').getDay()];
            const isToday = i === streak_dates.length - 1;
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: isToday ? 'var(--cyan)' : 'var(--text3)', marginBottom: 4, fontWeight: isToday ? 700 : 400 }}>
                  {dayLabel}
                </div>
                <div style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: 8,
                  background: d.practiced
                    ? isToday ? fireColor : `${fireColor}bb`
                    : 'var(--border)',
                  border: isToday ? `2px solid ${d.practiced ? fireColor : 'var(--cyan)'}` : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                  transition: 'all 0.2s',
                  boxShadow: d.practiced ? `0 0 8px ${fireColor}44` : 'none'
                }}>
                  {d.practiced ? '🔥' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational message */}
      <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8, fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
        {current_streak === 0 && '🚀 Start your streak today! Complete any interview or test.'}
        {current_streak === 1 && '✨ Great start! Come back tomorrow to build your streak.'}
        {current_streak >= 2 && current_streak < 7 && `🔥 ${current_streak} days strong! Keep going to hit a week streak!`}
        {current_streak === 7 && '🎉 One week streak! You are on fire!'}
        {current_streak > 7 && current_streak < 30 && `💪 ${current_streak} day streak! You are crushing it!`}
        {current_streak >= 30 && `🏆 ${current_streak} days! You are an interview preparation legend!`}
      </div>

      <style>{`
        @keyframes flamePulse {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          50% { transform: scale(1.1) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}