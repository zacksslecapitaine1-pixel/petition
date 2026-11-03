import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, ArrowRight, Check, X, Clock, CalendarX2, Vote, Share2, Link2, UserPlus, Loader2, AlertCircle, PenLine, Sparkles, MessageCircle, Phone, ShieldCheck, User, UserRound, BarChart3, FileText,
} from 'lucide-react';
import WeekViz from '../components/WeekViz';
import SignaturePad from '../components/SignaturePad';
import { NeuralIllustration, CodeIllustration } from '../components/Illustrations';
import { FILIERES, SCHOOL } from '../lib/config';
import { useCountUp, useStats, NAME_RE, pad, normalizePhone, formatPhone } from '../lib/hooks';

const Back = ({ onClick }) => (
  <button className="back" onClick={onClick} type="button"><ArrowLeft size={16} /> Retour</button>
);

/* ------------------------------ ACCUEIL ------------------------------ */
export function HomeStep({ onStart, done, onShowCard, onDashboard }) {
  const [mode, setMode] = useState('now');
  const stats = useStats();
  const count = useCountUp(stats?.total ?? 0);
  useEffect(() => {
    const id = setInterval(() => setMode((m) => (m === 'now' ? 'new' : 'now')), 3800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hero">
      <div>
        <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Pétition de classe · {SCHOOL}</motion.div>
        <motion.h1 className="title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.6 }}>
          Libérons notre <em>samedi</em>.
        </motion.h1>
        <motion.p className="lead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          Notre classe demande à l’administration de répartir les cours du samedi sur les autres jours de la semaine. Votre avis compte : une minute, une signature, et c’est enregistré.
        </motion.p>
        <div className="spacer" />
        <motion.div className="row" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <button className="btn primary big" onClick={onStart}>Je participe <ArrowRight size={20} /></button>
          {done && <button className="btn ghost" onClick={onShowCard}>Revoir ma carte (N° {pad(done.numero)})</button>}
          {done && <button className="btn ghost" onClick={onDashboard}><BarChart3 size={18} /> Voir le tableau de bord</button>}
        </motion.div>
        <div className="spacer" />
        <motion.div className="row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <span className="pill"><span className="live-dot" /> <b>{count}</b> camarade{count > 1 ? 's ont' : ' a'} déjà signé</span>
          <span className="pill"><Clock size={15} /> Moins d’une minute</span>
        </motion.div>
      </div>
      <motion.div className="hero-viz" initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 90, damping: 16 }}>
        <WeekViz mode={mode} title="Une semaine plus respirable" />
      </motion.div>
    </div>
  );
}

/* ------------------------------ FILIÈRE ------------------------------ */
export function FiliereStep({ value, onPick, onBack }) {
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 1</div>
      <h2 className="title">Dans quelle <em>filière</em> êtes-vous ?</h2>
      <p className="lead">Choisissez votre parcours. Il permet de classer les signatures dans le document final.</p>
      <div className="fil-grid">
        {Object.values(FILIERES).map((f, i) => (
          <motion.button key={f.id} type="button" className={`fil ${value === f.id ? 'on' : ''}`} onClick={() => onPick(f.id)}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} whileTap={{ scale: 0.98 }}>
            {value === f.id && <motion.span className="check-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18} /></motion.span>}
            {f.id === 'ia_bigdata' ? <NeuralIllustration /> : <CodeIllustration />}
            <h3>{f.label}</h3>
            <p>{f.tagline}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ CONTEXTE ------------------------------ */
export function ContextStep({ onNext, onBack }) {
  const [mode, setMode] = useState('now');
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 2 · De quoi s’agit-il ?</div>
      <h2 className="title">Une semaine <em>6 jours sur 7</em>… et si on changeait ça ?</h2>
      <p className="lead">Nos cours vont du lundi au samedi, de 7h30 à 14h. La classe propose de déplacer les cours du samedi sur d’autres jours, quitte à finir à 17h ou 18h certains soirs.</p>
      <div className="spacer" />
      <div className="row" style={{ justifyContent: 'center', marginBottom: 14 }}>
        <div className="seg-toggle" role="tablist">
          <button className={mode === 'now' ? 'on' : ''} onClick={() => setMode('now')} role="tab">Aujourd’hui</button>
          <button className={mode === 'new' ? 'on' : ''} onClick={() => setMode('new')} role="tab">Notre proposition</button>
        </div>
      </div>
      <WeekViz mode={mode} title="Exemple d’organisation" />
      <div className="facts">
        <div className="fact"><span className="ic"><CalendarX2 size={20} /></span><div><b>Pas de vrai repos</b><span>Aucun jour complet libre dans la semaine.</span></div></div>
        <div className="fact"><span className="ic"><Clock size={20} /></span><div><b>Quelques soirs plus longs</b><span>Fin de cours à 17h ou 18h certains jours.</span></div></div>
        <div className="fact"><span className="ic"><Vote size={20} /></span><div><b>Votre avis décide</b><span>Pour ou contre : chaque voix est comptée.</span></div></div>
      </div>
      <div className="spacer" />
      <button className="btn primary big" onClick={onNext}>J’ai compris, je continue <ArrowRight size={20} /></button>
    </div>
  );
}

/* ------------------------------ NOM / PRÉNOM ------------------------------ */
export function TextStep({ eyebrow, title, label, placeholder, value, onChange, onNext, onBack, upper, autoComplete }) {
  const [touched, setTouched] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 350); return () => clearTimeout(t); }, []);
  const clean = value.replace(/\s+/g, ' ').trim();
  const ok = NAME_RE.test(clean);
  const go = () => { setTouched(true); if (ok) onNext(); };
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="title">{title}</h2>
      <div className="field">
        <label htmlFor="t">{label}</label>
        <input id="t" ref={ref} className={`input ${upper ? 'upper' : ''}`} value={value} placeholder={placeholder} maxLength={60}
          autoComplete={autoComplete} autoCapitalize="words" enterKeyHint="next"
          onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
        {touched && !ok && <div className="err"><AlertCircle size={16} style={{ flex: 'none', marginTop: 3 }} /> Entrez au moins 2 lettres (lettres, espaces, tirets et apostrophes uniquement).</div>}
        <div className="hint">Écrivez-le comme sur vos documents officiels.</div>
      </div>
      <div className="spacer" />
      <button className="btn primary big" onClick={go} disabled={!clean}>Continuer <ArrowRight size={20} /></button>
    </div>
  );
}


/* ------------------------------ GENRE ------------------------------ */
export function GenreStep({ value, onPick, onBack }) {
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 5</div>
      <h2 className="title">Vous êtes <em>un homme</em> ou <em>une femme</em> ?</h2>
      <p className="lead">Cette information sert uniquement aux statistiques de la classe.</p>
      <div className="pos-grid">
        {[['homme', 'Homme', User], ['femme', 'Femme', UserRound]].map(([id, label, Icon], i) => (
          <motion.button key={id} type="button" className={`pos genre ${value === id ? 'on' : ''}`} onClick={() => onPick(id)} whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.08 }}>
            <span className="big-ic"><Icon size={30} /></span>
            <b>{label}</b>
            {value === id && <motion.span className="check-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18} /></motion.span>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ TÉLÉPHONE ------------------------------ */
export function PhoneStep({ value, onChange, onNext, onBack }) {
  const [touched, setTouched] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 350); return () => clearTimeout(t); }, []);
  const norm = normalizePhone(value);
  const go = () => { setTouched(true); if (norm) onNext(); };
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 6</div>
      <h2 className="title">Quel est votre <em>numéro de téléphone</em> ?</h2>
      <div className="field">
        <label htmlFor="tel">Téléphone</label>
        <input id="tel" ref={ref} className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="Ex. 92 10 19 69" value={value} maxLength={22}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9+\s.\-()]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && go()} enterKeyHint="next" />
        {touched && !norm && <div className="err"><AlertCircle size={16} style={{ flex: 'none', marginTop: 3 }} /> Entrez un numéro valide : 8 chiffres (Togo) ou au format international +228…</div>}
        {norm && <div className="hint" style={{ color: 'var(--ok)' }}><Check size={13} style={{ verticalAlign: -2 }} /> {formatPhone(norm)}</div>}
        <div className="hint"><ShieldCheck size={13} style={{ verticalAlign: -2 }} /> Visible uniquement par les organisateurs de la pétition.</div>
      </div>
      <div className="spacer" />
      <button className="btn primary big" onClick={go} disabled={!value.trim()}>Continuer <ArrowRight size={20} /></button>
    </div>
  );
}

/* ------------------------------ POSITION ------------------------------ */
export function PositionStep({ value, onPick, onBack }) {
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 7</div>
      <h2 className="title">Quelle est <em>votre position</em> ?</h2>
      <p className="lead">Les deux choix sont comptés de la même façon. Répondez librement.</p>
      <div className="pos-grid">
        <motion.button type="button" className={`pos pour ${value === 'pour' ? 'on' : ''}`} onClick={() => onPick('pour')} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <span className="big-ic"><Check size={30} strokeWidth={3} /></span>
          <b>POUR</b>
          <span>Je souhaite que les cours du samedi soient reportés sur les autres jours.</span>
        </motion.button>
        <motion.button type="button" className={`pos contre ${value === 'contre' ? 'on' : ''}`} onClick={() => onPick('contre')} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <span className="big-ic"><X size={30} strokeWidth={3} /></span>
          <b>CONTRE</b>
          <span>Je préfère conserver l’emploi du temps actuel.</span>
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------------------ SIGNATURE ------------------------------ */
export function SignatureStep({ value, onChange, onNext, onBack }) {
  const padRef = useRef(null);
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 8</div>
      <h2 className="title">Apposez <em>votre signature</em></h2>
      <p className="lead">Dessinez-la comme sur vos documents officiels. Elle figurera sur le document remis à l’administration.</p>
      <SignaturePad ref={padRef} onChange={onChange} />
      {!value && <div className="kbd"><PenLine size={13} style={{ verticalAlign: -2 }} /> Faites un trait assez long pour que la signature soit valide.</div>}
      <div className="spacer" />
      <button className="btn primary big" onClick={onNext} disabled={!value}>Continuer <ArrowRight size={20} /></button>
    </div>
  );
}

/* ------------------------------ RÉCAP ------------------------------ */
export function RecapStep({ data, onSubmit, onBack, loading, error }) {
  const [ok, setOk] = useState(false);
  const f = FILIERES[data.filiere];
  return (
    <div className="step card">
      <Back onClick={onBack} />
      <div className="eyebrow">Étape 9 · Dernière vérification</div>
      <h2 className="title">Tout est <em>correct</em> ?</h2>
      <div className="recap">
        <div className="recap-row"><div><small>Filière</small><b>{f.label}</b></div></div>
        <div className="recap-row"><div><small>Étudiant</small><b style={{ textTransform: 'uppercase' }}>{data.nom}</b> <b style={{ textTransform: 'capitalize' }}>{data.prenom}</b></div></div>
        <div className="recap-row"><div><small>Genre</small><b>{data.genre === 'femme' ? 'Femme' : 'Homme'}</b></div><div><small>Téléphone</small><b>{formatPhone(normalizePhone(data.telephone) || data.telephone)}</b></div></div>
        <div className="recap-row"><div><small>Position</small><span className={`chip ${data.position}`}>{data.position === 'pour' ? <Check size={14} /> : <X size={14} />} {data.position}</span></div></div>
        <div className="recap-row"><div><small>Signature</small></div><div className="sig-prev"><img src={data.signature} alt="Votre signature" /></div></div>
      </div>
      <label className="confirm"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> Je confirme que ces informations sont exactes et que c’est bien moi qui signe. Un seul vote par étudiant.</label>
      {error && <div className="err"><AlertCircle size={16} style={{ flex: 'none', marginTop: 3 }} /> {error}</div>}
      <div className="spacer" />
      <button className="btn primary big" onClick={onSubmit} disabled={!ok || loading}>
        {loading ? (<><span className="spinner" /> Enregistrement…</>) : (<>Enregistrer ma participation <Sparkles size={20} /></>)}
      </button>
    </div>
  );
}

/* ------------------------------ SUCCÈS ------------------------------ */
export function DoneStep({ entry, onAnother, onDashboard, onLetter }) {
  const num = useCountUp(entry.numero, 1200);
  const stats = useStats(8000);
  const [toast, setToast] = useState('');
  const url = window.location.href.split('#')[0];
  const msg = `Salut ! La classe lance une pétition pour libérer le samedi. Donne ton avis en 1 minute : ${url}`;
  useEffect(() => {
    const end = Date.now() + 1400;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const colors = ['#f2c46d', '#c8243e', '#fff1cf', '#4fd6a0'];
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    return () => confetti.reset();
  }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setToast('Lien copié !'); } catch { setToast(url); }
    setTimeout(() => setToast(''), 2200);
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'Libérons notre samedi', text: msg, url }); return; } catch { /* annulé */ } }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };
  return (
    <div className="step">
      <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ justifyContent: 'center', display: 'flex' }}>Participation enregistrée</motion.div>
      <motion.h2 className="title" style={{ textAlign: 'center', marginBottom: 22 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>Merci, <em style={{ textTransform: 'capitalize' }}>{entry.prenom}</em> !</motion.h2>
      <motion.div className="ticket" initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.94 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 14, delay: 0.15 }}>
        <div className="t-top">
          <div><small>Carte de participation · {SCHOOL}</small><div className="t-name"><span style={{ textTransform: 'uppercase' }}>{entry.nom}</span> <span style={{ textTransform: 'capitalize' }}>{entry.prenom}</span></div><small style={{ display: 'block', marginTop: 6 }}>{FILIERES[entry.filiere].label}</small></div>
          <div style={{ textAlign: 'right' }}><small>N°</small><div className="num">{pad(num)}</div></div>
        </div>
        <div className="t-sep" />
        <div className="t-sig">
          <div><small style={{ display: 'block', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8f6b5d', fontWeight: 600 }}>Signature</small><img src={entry.signature} alt="Signature" /></div>
          <span className={`stamp ${entry.position}`}>{entry.position}</span>
        </div>
      </motion.div>
      <p className="lead" style={{ textAlign: 'center', margin: '18px auto 0' }}>Gardez votre numéro. {stats ? `${stats.total} camarade${stats.total > 1 ? 's ont' : ' a'} déjà signé.` : ''}</p>
      <div className="share-row">
        <button className="btn gold" onClick={share}><MessageCircle size={18} /> Inviter la classe</button>
        <button className="btn ghost" onClick={copy}><Link2 size={18} /> Copier le lien</button>
      </div>
      <motion.button className="dash-cta" onClick={onDashboard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} whileTap={{ scale: 0.98 }}>
        <span className="ic"><BarChart3 size={22} /></span>
        <span><b>Voir le tableau de bord</b><small>Les statistiques de la pétition et la lettre remise à l’administration</small></span>
        <ArrowRight size={20} />
      </motion.button>
      <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <button className="btn ghost small" onClick={onLetter}><FileText size={16} /> Lire la lettre</button>
        <button className="btn ghost small" onClick={onAnother}><UserPlus size={16} /> Enregistrer un autre camarade</button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
