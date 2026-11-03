import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Background from './components/Background';
import { HomeStep, FiliereStep, ContextStep, TextStep, GenreStep, PhoneStep, PositionStep, SignatureStep, RecapStep, DoneStep } from './steps/Steps';
import { normalizePhone } from './lib/hooks';
import Admin from './admin/Admin';
import { submitSignature } from './lib/api';
import { useHash } from './lib/hooks';
import { DEMO } from './lib/config';

const ORDER = ['home', 'filiere', 'context', 'nom', 'prenom', 'genre', 'telephone', 'position', 'signature', 'recap'];
const PROGRESS_STEPS = ORDER.slice(1); // 9 étapes

const DRAFT_KEY = 'petition:draft:v1';
const DONE_KEY = 'petition:done:v1';

const safeGet = (store, key) => { try { return JSON.parse(store.getItem(key) || 'null'); } catch { return null; } };
const safeSet = (store, key, val) => { try { store.setItem(key, JSON.stringify(val)); } catch { /* stockage indisponible */ } };
const safeDel = (store, key) => { try { store.removeItem(key); } catch { /* ignore */ } };

const variants = {
  enter: (d) => ({ opacity: 0, x: d * 70, filter: 'blur(10px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (d) => ({ opacity: 0, x: d * -70, filter: 'blur(10px)' }),
};

function Progress({ step }) {
  const idx = PROGRESS_STEPS.indexOf(step);
  if (idx < 0) return <div />;
  return (
    <div className="progress" aria-label={`Étape ${idx + 1} sur ${PROGRESS_STEPS.length}`}>
      {PROGRESS_STEPS.map((s, i) => (
        <div className="seg" key={s}>
          <motion.i initial={false} animate={{ scaleX: i <= idx ? 1 : 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        </div>
      ))}
      <small>{idx + 1}/{PROGRESS_STEPS.length}</small>
    </div>
  );
}

function Petition() {
  const [step, setStep] = useState('home');
  const [dir, setDir] = useState(1);
  const [data, setData] = useState(() => {
    const d = safeGet(sessionStorage, DRAFT_KEY) || {};
    return { filiere: d.filiere || '', nom: d.nom || '', prenom: d.prenom || '', genre: d.genre || '', telephone: d.telephone || '', position: d.position || '', signature: '' };
  });
  const [done, setDone] = useState(() => safeGet(localStorage, DONE_KEY));
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { signature, ...draft } = data;
    safeSet(sessionStorage, DRAFT_KEY, draft);
  }, [data]);

  const go = useCallback((s, d = 1) => { setDir(d); setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const next = () => go(ORDER[ORDER.indexOf(step) + 1]);
  const prev = () => go(ORDER[Math.max(0, ORDER.indexOf(step) - 1)], -1);
  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await submitSignature({ ...data, nom: data.nom.trim(), prenom: data.prenom.trim(), telephone: normalizePhone(data.telephone) || data.telephone });
      const saved = { numero: res.numero, nom: data.nom.trim(), prenom: data.prenom.trim(), filiere: data.filiere, genre: data.genre, position: data.position, signature: data.signature };
      safeSet(localStorage, DONE_KEY, saved);
      safeDel(sessionStorage, DRAFT_KEY);
      setDone(saved);
      setEntry(saved);
      go('done');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const another = () => {
    setData({ filiere: data.filiere, nom: '', prenom: '', genre: '', telephone: '', position: '', signature: '' });
    setEntry(null);
    setError('');
    go('nom');
  };

  let view;
  switch (step) {
    case 'home': view = <HomeStep onStart={() => go('filiere')} done={done} onShowCard={() => { setEntry(done); go('done'); }} />; break;
    case 'filiere': view = <FiliereStep value={data.filiere} onBack={prev} onPick={(f) => { set({ filiere: f }); setTimeout(() => go('context'), 380); }} />; break;
    case 'context': view = <ContextStep onBack={prev} onNext={next} />; break;
    case 'nom': view = <TextStep eyebrow="Étape 3" title={<>Quel est votre <em>nom</em> ?</>} label="Nom de famille" placeholder="Ex. AGBODJAN" upper autoComplete="family-name" value={data.nom} onChange={(v) => set({ nom: v })} onBack={prev} onNext={next} />; break;
    case 'prenom': view = <TextStep eyebrow="Étape 4" title={<>Et votre <em>prénom</em> ?</>} label="Prénom(s)" placeholder="Ex. Komlan Jean" autoComplete="given-name" value={data.prenom} onChange={(v) => set({ prenom: v })} onBack={prev} onNext={next} />; break;
    case 'genre': view = <GenreStep value={data.genre} onBack={prev} onPick={(g) => { set({ genre: g }); setTimeout(() => go('telephone'), 350); }} />; break;
    case 'telephone': view = <PhoneStep value={data.telephone} onChange={(v) => set({ telephone: v })} onBack={prev} onNext={next} />; break;
    case 'position': view = <PositionStep value={data.position} onBack={prev} onPick={(p) => { set({ position: p }); setTimeout(() => go('signature'), 350); }} />; break;
    case 'signature': view = <SignatureStep value={data.signature} onChange={(s) => set({ signature: s || '' })} onBack={prev} onNext={next} />; break;
    case 'recap': view = <RecapStep data={data} loading={loading} error={error} onBack={prev} onSubmit={submit} />; break;
    case 'done': view = entry ? <DoneStep entry={entry} onAnother={another} /> : null; break;
    default: view = null;
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="logo-pill" href="#/" onClick={() => go('home', -1)} aria-label="Accueil"><img src="./logo.png" alt="ESGIS" /></a>
        <Progress step={step} />
      </header>
      <main className="stage">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            {view}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="footer">Pétition de classe · Licence 1 Informatique · ESGIS · <a href="#/admin">Espace administrateur</a></footer>
    </div>
  );
}

export default function App() {
  const hash = useHash();
  const isAdmin = hash.startsWith('#/admin');
  return (
    <>
      <Background />
      {isAdmin ? <Admin /> : <Petition />}
      {DEMO && (
        <div className="demo-bar no-print">
          <span><b>Aperçu</b> · données fictives, rien n’est enregistré</span>
          <a href="#/">Site</a>
          <a href="#/admin">Admin (mot de passe : demo)</a>
        </div>
      )}
    </>
  );
}
