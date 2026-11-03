import React from 'react';
import { motion } from 'framer-motion';

/* Réseau de neurones animé (IA & Big Data) */
export function NeuralIllustration() {
  const L1 = [[30, 25], [30, 60], [30, 95]];
  const L2 = [[110, 15], [110, 45], [110, 75], [110, 105]];
  const L3 = [[190, 40], [190, 80]];
  const links = [];
  L1.forEach((a) => L2.forEach((b) => links.push([a, b])));
  L2.forEach((a) => L3.forEach((b) => links.push([a, b])));
  return (
    <svg className="ill" viewBox="0 0 220 120" role="img" aria-label="Réseau de neurones">
      {links.map(([a, b], i) => (
        <motion.line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#f2c46d" strokeWidth="1" strokeOpacity="0.35"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeOpacity: [0.15, 0.7, 0.15] }}
          transition={{ pathLength: { duration: 1.2, delay: i * 0.03 }, strokeOpacity: { repeat: Infinity, duration: 3, delay: (i % 7) * 0.25 } }} />
      ))}
      {[...L1, ...L2, ...L3].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="6.5" fill={i < 3 ? '#c8243e' : i < 7 ? '#f2c46d' : '#fff1cf'}
          animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 2.4, delay: (i % 5) * 0.3 }} style={{ transformOrigin: `${x}px ${y}px` }} />
      ))}
    </svg>
  );
}

/* Fenêtre de code animée (Dev Web & Apps) */
export function CodeIllustration() {
  const lines = [
    { w: 70, c: '#f2c46d', x: 34 }, { w: 110, c: '#fff1cf', x: 46 }, { w: 54, c: '#e23a55', x: 46 },
    { w: 94, c: '#fff1cf', x: 46 }, { w: 40, c: '#f2c46d', x: 34 }, { w: 80, c: '#e23a55', x: 34 },
  ];
  return (
    <svg className="ill" viewBox="0 0 220 120" role="img" aria-label="Fenêtre de code">
      <rect x="8" y="6" width="204" height="108" rx="12" fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.25)" />
      <rect x="8" y="6" width="204" height="20" rx="12" fill="rgba(255,255,255,.1)" />
      {['#ff6a78', '#f2c46d', '#4fd6a0'].map((c, i) => <circle key={c} cx={22 + i * 14} cy="16" r="3.6" fill={c} />)}
      {lines.map((l, i) => (
        <motion.rect key={i} x={l.x} y={36 + i * 13} height="6" rx="3" fill={l.c} fillOpacity="0.9"
          initial={{ width: 0 }} animate={{ width: [0, l.w, l.w] }} transition={{ duration: 2.4, delay: i * 0.25, repeat: Infinity, repeatDelay: 2.2, times: [0, 0.35, 1] }} />
      ))}
      <motion.rect x="150" y="36" width="6" height="12" fill="#fff" animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
    </svg>
  );
}

export function CheckBurst() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <motion.circle cx="32" cy="32" r="28" fill="none" stroke="#4fd6a0" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
      <motion.path d="M19 33l9 9 17-19" fill="none" stroke="#4fd6a0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    </svg>
  );
}
