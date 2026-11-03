// Faux serveur en mémoire utilisé uniquement par la version démo (aperçu).
import { ApiError } from './apiError';

const DEMO_PASSWORD = 'demo';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function fakeSignature(seed) {
  const c = document.createElement('canvas');
  c.width = 560; c.height = 200;
  const g = c.getContext('2d');
  g.strokeStyle = '#1d1830'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  const a = 6 + (seed % 5), b = 40 + (seed * 13) % 40;
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = 30 + t * 500;
    const y = 100 + Math.sin(t * a + seed) * b * (1 - t * 0.5) + Math.cos(t * 23 + seed) * 8;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
  g.beginPath(); g.moveTo(60, 170); g.lineTo(60 + 280 + (seed % 4) * 40, 160 - (seed % 3) * 6); g.stroke();
  return c.toDataURL('image/png');
}

const SEED = [
  ['ia_bigdata', 'KOUASSI', 'Ama Grace', 'femme', '+22890000001', 'pour'],
  ['dev_web', 'MENSAH', 'Kodjo', 'homme', '+22890000002', 'pour'],
  ['ia_bigdata', 'TCHALIM', 'Yao Marc', 'homme', '+22890000003', 'contre'],
  ['dev_web', 'ATTIOGBE', 'Afi', 'femme', '+22890000004', 'pour'],
  ['dev_web', 'LAWSON', 'Komi', 'homme', '+22890000005', 'pour'],
  ['ia_bigdata', 'DOSSEH', 'Esso Prisca', 'femme', '+22890000006', 'contre'],
];

let DB = null;
function db() {
  if (!DB) {
    DB = SEED.map(([filiere, nom, prenom, genre, telephone, position], i) => ({
      id: `demo${i + 1}`, numero: i + 1, filiere, nom, prenom, genre, telephone, position,
      signature: fakeSignature(i + 2), created_at: new Date(Date.now() - (SEED.length - i) * 7 * 60000).toISOString(),
    }));
  }
  return DB;
}

const key = (nom, prenom) => `${nom} ${prenom}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).sort().join(' ');

export async function submitSignature(p) {
  await wait(700);
  const k = key(p.nom, p.prenom);
  if (db().some((r) => r.filiere === p.filiere && key(r.nom, r.prenom) === k)) throw new ApiError('already_registered', 'Cette personne s’est déjà enregistrée dans cette filière. Un seul vote par étudiant.');
  const numero = db().length + 1;
  db().push({ id: `demo${numero}`, numero, filiere: p.filiere, nom: p.nom.toUpperCase(), prenom: p.prenom, genre: p.genre, telephone: p.telephone, position: p.position, signature: p.signature, created_at: new Date().toISOString() });
  return { numero };
}
export async function getStats() {
  const d = db();
  return { total: d.length, ia_bigdata: d.filter((r) => r.filiere === 'ia_bigdata').length, dev_web: d.filter((r) => r.filiere === 'dev_web').length };
}
const check = (pw) => { if (String(pw).trim().toLowerCase() !== DEMO_PASSWORD) throw new ApiError('unauthorized', 'Mot de passe incorrect. (Aperçu : le mot de passe est « demo ».)'); };
export async function adminLogin(pw) { await wait(300); check(pw); return true; }
export async function adminList(pw) { check(pw); return db().slice(); }
export async function adminSetPassword() { throw new ApiError('demo', 'Indisponible dans l’aperçu.'); }
