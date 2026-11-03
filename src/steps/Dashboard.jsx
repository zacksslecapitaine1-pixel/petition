import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, ThumbsUp, ThumbsDown, Mail, ShieldCheck } from 'lucide-react';
import { FILIERES } from '../lib/config';
import { useDashboard, useCountUp } from '../lib/hooks';
import { LetterPaper } from '../components/Letter';

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function Big({ icon: Icon, label, value, tone }) {
  const v = useCountUp(value);
  return (
    <div className={`stat ${tone || ''}`}>
      <small style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon size={14} /> {label}</small>
      <b>{v}</b>
    </div>
  );
}

function Donut({ pour, contre }) {
  const total = pour + contre;
  const R = 54, C = 2 * Math.PI * R;
  const p = total ? pour / total : 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={`${pct(pour, total)} % pour`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="16" />
        {total > 0 && <circle cx="70" cy="70" r={R} fill="none" stroke="#ff7a86" strokeWidth="16" />}
        {total > 0 && (
          <motion.circle cx="70" cy="70" r={R} fill="none" stroke="#4fd6a0" strokeWidth="16" strokeLinecap="butt" transform="rotate(-90 70 70)"
            strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - p) }} transition={{ duration: 1.1, ease: 'easeOut' }} />
        )}
        <text x="70" y="68" textAnchor="middle" fill="#fbf3e8" fontSize="26" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">{total ? `${pct(pour, total)} %` : '–'}</text>
        <text x="70" y="88" textAnchor="middle" fill="#cbb9b4" fontSize="11">POUR</text>
      </svg>
    </div>
  );
}

function SplitBar({ label, pour, contre }) {
  const total = pour + contre;
  return (
    <div className="split">
      <div className="split-h"><span>{label}</span><span style={{ color: 'var(--muted)' }}>{total} participant{total > 1 ? 's' : ''}</span></div>
      <div className="bar">
        <motion.i className="p" initial={{ width: 0 }} animate={{ width: `${total ? (pour / total) * 100 : 0}%` }} transition={{ duration: 0.9 }} />
        <motion.i className="c" initial={{ width: 0 }} animate={{ width: `${total ? (contre / total) * 100 : 0}%` }} transition={{ duration: 0.9 }} />
      </div>
      <div className="split-f"><span style={{ color: 'var(--ok)' }}>{pour} pour</span><span style={{ color: 'var(--no)' }}>{contre} contre</span></div>
    </div>
  );
}

function Spark({ days }) {
  if (!days || days.length < 1) return null;
  const pts = [];
  let acc = 0;
  days.forEach((d) => { acc += d.n; pts.push(acc); });
  const W = 300, H = 90, pad = 8;
  const max = Math.max(1, ...pts);
  const xs = (i) => (pts.length === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (pts.length - 1));
  const ys = (v) => H - pad - (v / max) * (H - pad * 2);
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(' ');
  const area = `${line} L${xs(pts.length - 1).toFixed(1)} ${H - pad} L${xs(0).toFixed(1)} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark-svg" role="img" aria-label="Évolution du nombre de participants">
      <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f2c46d" stopOpacity=".5" /><stop offset="1" stopColor="#f2c46d" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#sg)" />
      <motion.path d={line} fill="none" stroke="#f2c46d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
      <circle cx={xs(pts.length - 1)} cy={ys(pts[pts.length - 1])} r="5" fill="#fff1cf" />
    </svg>
  );
}

export default function PublicDashboard({ onBack, myNumber }) {
  const { data, error } = useDashboard();
  const d = data;
  return (
    <div className="step dash">
      <button className="back" onClick={onBack} type="button"><ArrowLeft size={16} /> Retour</button>
      <div className="eyebrow">Tableau de bord de la classe</div>
      <h2 className="title">Où en est <em>la pétition</em> ?</h2>
      <p className="lead">Seules les statistiques sont publiques. Les noms, les numéros de téléphone et les signatures restent réservés aux organisateurs.</p>
      <div className="spacer" />

      {!d && <div className="card" style={{ textAlign: 'center' }}>{error ? 'Impossible de charger les statistiques. Vérifiez votre connexion.' : <span className="spinner" />}</div>}

      {d && (
        <>
          <div className="stats">
            <Big icon={Users} label="Participants" value={d.total} tone="gold" />
            <Big icon={ThumbsUp} label="Pour" value={d.pour} tone="ok" />
            <Big icon={ThumbsDown} label="Contre" value={d.contre} tone="no" />
            <div className="stat"><small>Hommes / Femmes</small><b>{d.hommes} / {d.femmes}</b></div>
          </div>

          <div className="dash-grid">
            <div className="card dash-card">
              <h3>Résultat global</h3>
              <div className="dash-row">
                <Donut pour={d.pour} contre={d.contre} />
                <div className="dash-legend">
                  <span><i style={{ background: '#4fd6a0' }} /> Pour : <b>{d.pour}</b></span>
                  <span><i style={{ background: '#ff7a86' }} /> Contre : <b>{d.contre}</b></span>
                  {myNumber && <span style={{ color: 'var(--muted)' }}>Votre participation : N° {String(myNumber).padStart(3, '0')}</span>}
                </div>
              </div>
            </div>
            <div className="card dash-card">
              <h3>Par filière</h3>
              {Object.values(FILIERES).map((f) => <SplitBar key={f.id} label={f.label} pour={d[f.id].pour} contre={d[f.id].contre} />)}
            </div>
            {d.days.length > 1 && (
              <div className="card dash-card" style={{ gridColumn: '1 / -1' }}>
                <h3>Progression des participations</h3>
                <Spark days={d.days} />
                <div className="hint">Total cumulé depuis le début de la pétition.</div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="spacer" />
      <div className="eyebrow"><Mail size={14} /> La lettre remise à l’administration</div>
      <LetterPaper />
      <div className="hint" style={{ textAlign: 'center', marginTop: 14 }}><ShieldCheck size={13} style={{ verticalAlign: -2 }} /> La liste des participants n’est visible que par les organisateurs.</div>
    </div>
  );
}
