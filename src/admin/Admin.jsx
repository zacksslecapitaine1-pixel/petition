import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, RefreshCw, Printer, Download, Search, ShieldCheck, ArrowLeft, KeyRound, Check, X } from 'lucide-react';
import { adminLogin, adminList, adminSetPassword } from '../lib/api';
import { FILIERES, DEMO } from '../lib/config';
import { useCountUp, formatPhone } from '../lib/hooks';
import PrintReport, { computeStats, fmtDate } from './PrintReport';

const PW_KEY = 'petition:admin:v1';
const getPw = () => { try { return sessionStorage.getItem(PW_KEY) || ''; } catch { return ''; } };
const setPw = (v) => { try { v ? sessionStorage.setItem(PW_KEY, v) : sessionStorage.removeItem(PW_KEY); } catch { /* ignore */ } };

const Stat = ({ label, value, cls }) => {
  const v = useCountUp(value);
  return <div className={`stat ${cls || ''}`}><small>{label}</small><b>{v}</b></div>;
};

function Login({ onOk }) {
  const [pw, setPwInput] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try { await adminLogin(pw); setPw(pw); onOk(pw); } catch (ex) { setErr(ex.message); } finally { setLoading(false); }
  };
  return (
    <div className="admin"><div className="admin-in login">
      <motion.form className="card" onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="eyebrow"><Lock size={14} /> Espace administrateur</div>
        <h1 className="title" style={{ fontSize: 34 }}>Accès <em>protégé</em></h1>
        <p className="lead" style={{ fontSize: 15 }}>Réservé à l’organisateur et au délégué de classe.</p>
        <div className="pw-row">
          <input className="pw-input" type="password" placeholder="Mot de passe" value={pw} onChange={(e) => setPwInput(e.target.value)} autoFocus autoComplete="current-password" />
          {err && <div className="err">{err}</div>}
          <button className="btn primary" disabled={!pw || loading}>{loading ? <span className="spinner" /> : <><ShieldCheck size={18} /> Se connecter</>}</button>
          <a className="back" href="#/" style={{ justifyContent: 'center' }}><ArrowLeft size={14} /> Retour au site</a>
        </div>
      </motion.form>
    </div></div>
  );
}

function SettingsTab({ pw, onChanged }) {
  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    if (n1 !== n2) return setMsg({ ok: false, t: 'Les deux mots de passe ne correspondent pas.' });
    setLoading(true);
    try { await adminSetPassword(pw, n1); setPw(n1); onChanged(n1); setN1(''); setN2(''); setMsg({ ok: true, t: 'Mot de passe modifié.' }); }
    catch (ex) { setMsg({ ok: false, t: ex.message }); } finally { setLoading(false); }
  };
  return (
    <form className="card" onSubmit={save} style={{ maxWidth: 520 }}>
      <div className="eyebrow"><KeyRound size={14} /> Sécurité</div>
      <h2 className="title" style={{ fontSize: 28 }}>Changer le mot de passe</h2>
      <div className="pw-row">
        <input className="pw-input" type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={n1} onChange={(e) => setN1(e.target.value)} autoComplete="new-password" />
        <input className="pw-input" type="password" placeholder="Confirmer le mot de passe" value={n2} onChange={(e) => setN2(e.target.value)} autoComplete="new-password" />
        {msg && <div className={msg.ok ? 'chip pour' : 'err'} style={msg.ok ? { alignSelf: 'flex-start' } : undefined}>{msg.t}</div>}
        <button className="btn primary" disabled={!n1 || !n2 || loading}>Enregistrer</button>
      </div>
    </form>
  );
}

function Dashboard({ pw, onLogout, onPwChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('board');
  const [q, setQ] = useState('');
  const [fil, setFil] = useState('all');
  const [zoom, setZoom] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [includePhone, setIncludePhone] = useState(false);

  const load = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try { setRows((await adminList(pw)) || []); setErr(''); }
    catch (e) { setErr(e.message); if (e.code === 'unauthorized') onLogout(); }
    finally { setLoading(false); }
  }, [pw, onLogout]);

  useEffect(() => { load(false); const id = setInterval(() => !document.hidden && load(true), 20000); return () => clearInterval(id); }, [load]);

  const stats = useMemo(() => computeStats(rows), [rows]);
  const shown = useMemo(() => rows.filter((r) => (fil === 'all' || r.filiere === fil) && `${r.nom} ${r.prenom} ${r.numero} ${r.telephone}`.toLowerCase().includes(q.toLowerCase())), [rows, q, fil]);
  const pPour = stats.all.total ? (stats.all.pour / stats.all.total) * 100 : 0;
  const pContre = stats.all.total ? 100 - pPour : 0;
  const printDate = useMemo(() => { const d = new Date(`${date}T12:00:00`); return Number.isNaN(d.getTime()) ? new Date() : d; }, [date]);

  const exportCsv = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = ['Numero;Filiere;Nom;Prenom;Genre;Telephone;Position;Date'].concat(rows.map((r) => [r.numero, FILIERES[r.filiere].label, r.nom, r.prenom, r.genre === 'femme' ? 'Femme' : 'Homme', r.telephone, r.position, new Date(r.created_at).toLocaleString('fr-FR')].map(esc).join(';')));
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `petition-participants-${date}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  const printNow = () => { setTab('doc'); setTimeout(() => window.print(), 250); };

  return (
    <div className={`admin ${tab === 'doc' ? 'preview' : ''}`}>
      <div className="admin-in">
        <div className="a-top no-print">
          <div><div className="eyebrow">Espace administrateur</div><h1>Tableau de bord</h1></div>
          <div className="row">
            <button className="btn ghost small" onClick={() => load(false)}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Actualiser</button>
            {!DEMO && <button className="btn gold small" onClick={printNow}><Printer size={15} /> Imprimer / PDF</button>}
            <a className="btn ghost small" href="#/"><ArrowLeft size={15} /> Site</a>
            <button className="btn ghost small" onClick={onLogout}><LogOut size={15} /> Quitter</button>
          </div>
        </div>

        <div className="tabs no-print">
          {[['board', 'Participants'], ['doc', 'Document PDF'], ['settings', 'Sécurité']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {err && <div className="err no-print" style={{ marginBottom: 12 }}>{err}</div>}

        {tab === 'board' && (
          <div className="no-print">
            <div className="stats">
              <Stat label="Participants" value={stats.all.total} cls="gold" />
              <Stat label="Pour" value={stats.all.pour} cls="ok" />
              <Stat label="Contre" value={stats.all.contre} cls="no" />
              <div className="stat"><small>Répartition</small>
                <div className="bar" style={{ marginTop: 18 }}><motion.i className="p" animate={{ width: `${pPour}%` }} /><motion.i className="c" animate={{ width: `${pContre}%` }} /></div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{Math.round(pPour)} % pour · {Math.round(pContre)} % contre</div>
              </div>
            </div>
            <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div className="stat"><small>Hommes / Femmes</small><b style={{ fontSize: 30 }}>{stats.all.hommes} / {stats.all.femmes}</b><span style={{ color: 'var(--muted)', fontSize: 13 }}>répartition par genre</span></div>
              {Object.values(FILIERES).map((f) => (
                <div className="stat" key={f.id}><small>{f.label}</small><b style={{ fontSize: 30 }}>{stats[f.id].total}</b><span style={{ color: 'var(--muted)', fontSize: 13 }}>{stats[f.id].pour} pour · {stats[f.id].contre} contre</span></div>
              ))}
            </div>

            <div className="tools">
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--dim)' }} />
                <input className="search" style={{ paddingLeft: 36, width: '100%' }} placeholder="Rechercher un nom, un prénom, un numéro, un téléphone…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className="search" value={fil} onChange={(e) => setFil(e.target.value)}>
                <option value="all">Toutes les filières</option>
                {Object.values(FILIERES).map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {!DEMO && <button className="btn ghost small" onClick={exportCsv} disabled={!rows.length}><Download size={15} /> CSV</button>}
            </div>

            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>N°</th><th>Nom et prénom</th><th>Filière</th><th>Genre</th><th>Téléphone</th><th>Position</th><th>Signature</th><th>Date</th></tr></thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {shown.map((r) => (
                      <motion.tr key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <td><b>{String(r.numero).padStart(3, '0')}</b></td>
                        <td className="nm"><span style={{ textTransform: 'uppercase' }}>{r.nom}</span> {r.prenom}</td>
                        <td>{FILIERES[r.filiere].short}</td>
                        <td>{r.genre === 'femme' ? 'Femme' : 'Homme'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}><a href={`tel:${r.telephone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{formatPhone(r.telephone)}</a></td>
                        <td><span className={`chip ${r.position}`}>{r.position === 'pour' ? <Check size={13} /> : <X size={13} />} {r.position}</span></td>
                        <td><button className="thumb" onClick={() => setZoom(r)} aria-label="Agrandir la signature"><img src={r.signature} alt="" /></button></td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(r.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {!shown.length && <div className="empty">{loading ? 'Chargement…' : 'Aucune participation pour le moment.'}</div>}
            </div>
          </div>
        )}

        {tab === 'doc' && (
          <div className="no-print doc-bar">
            <label style={{ color: 'var(--muted)', fontSize: 14 }}>Date du document : <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label className="opt"><input type="checkbox" checked={includePhone} onChange={(e) => setIncludePhone(e.target.checked)} /> Inclure les numéros de téléphone dans le PDF</label>
            {!DEMO && <button className="btn gold small" onClick={() => window.print()}><Printer size={15} /> Imprimer / Enregistrer en PDF</button>}
            <span style={{ color: 'var(--dim)', fontSize: 13 }}>{DEMO ? 'Aperçu du document remis à l’administration (sur le vrai site : bouton Imprimer / PDF).' : 'Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF » (A4, marges par défaut).'}</span>
          </div>
        )}

        {tab === 'settings' && <div className="no-print"><SettingsTab pw={pw} onChanged={onPwChanged} /></div>}

        <PrintReport rows={rows} date={printDate} includePhone={includePhone} />
        <div className="no-print" style={{ height: 24 }} />
      </div>

      <AnimatePresence>
        {zoom && (
          <motion.div className="modal no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(null)}>
            <motion.div className="box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <b>{zoom.nom} {zoom.prenom}</b> <span style={{ color: '#8f6b5d' }}>· N° {zoom.numero} · {zoom.position}</span>
              <img src={zoom.signature} alt="Signature" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const [pw, setPwState] = useState(getPw());
  const [checking, setChecking] = useState(!!getPw());

  useEffect(() => {
    if (!pw) return;
    let alive = true;
    adminLogin(pw).then(() => alive && setChecking(false)).catch(() => { if (alive) { setPw(''); setPwState(''); setChecking(false); } });
    return () => { alive = false; };
    // vérification unique au chargement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => { setPw(''); setPwState(''); }, []);
  if (checking) return <div className="admin"><div className="admin-in" style={{ textAlign: 'center', paddingTop: '30vh' }}><span className="spinner" /></div></div>;
  if (!pw) return <Login onOk={setPwState} />;
  return <Dashboard pw={pw} onLogout={logout} onPwChanged={setPwState} />;
}
