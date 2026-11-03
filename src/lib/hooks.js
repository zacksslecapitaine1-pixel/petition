import { useEffect, useRef, useState } from 'react';
import { getStats } from './api';

export function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(a + (target - a) * e);
      setVal(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function useStats(interval = 15000) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const s = await getStats();
        if (alive) setStats(s);
      } catch {
        /* silencieux : le compteur est décoratif */
      }
    };
    load();
    const id = setInterval(() => !document.hidden && load(), interval);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [interval]);
  return stats;
}

export function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export const NAME_RE = /^[\p{L}][\p{L}\p{M}\s'’.\-]{1,59}$/u;

export const pad = (n, l = 3) => String(n).padStart(l, '0');

// Numéro togolais à 8 chiffres, ou numéro international (+ ou 00) de 8 à 15 chiffres.
export function normalizePhone(raw) {
  let v = String(raw || '').replace(/[\s.\-()]/g, '');
  if (/^[0-9]{8}$/.test(v)) v = '+228' + v;
  else if (/^00[0-9]+$/.test(v)) v = '+' + v.slice(2);
  return /^\+[0-9]{8,15}$/.test(v) ? v : null;
}

export function formatPhone(p) {
  if (!p) return '';
  const m = /^\+228([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})$/.exec(p);
  return m ? `+228 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}
