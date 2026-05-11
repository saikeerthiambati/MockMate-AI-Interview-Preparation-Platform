import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

export default function Timer({ seconds, onExpire, enabled = true, reset = 0 }) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, reset]);

  useEffect(() => {
    if (!enabled) return;
    if (remaining <= 0) { onExpire && onExpire(); return; }
    ref.current = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(ref.current);
  }, [remaining, enabled, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : `0:${String(secs).padStart(2, '0')}`;

  const cls = remaining <= 10 ? 'danger' : remaining <= 30 ? 'warning' : '';

  return (
    <div className={`timer ${cls}`}>
      <Clock size={14} />
      {display}
    </div>
  );
}
