import React, { useMemo } from 'react';

export default function Background() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        top: Math.round(Math.random() * 100),
        delay: (Math.random() * 6).toFixed(1),
        dur: (5 + Math.random() * 5).toFixed(1),
      })),
    [],
  );
  return (
    <div className="bg no-print" aria-hidden="true">
      <div className="orb o1" />
      <div className="orb o2" />
      <div className="orb o3" />
      {sparks.map((s) => (
        <span key={s.id} className="spark" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
    </div>
  );
}
