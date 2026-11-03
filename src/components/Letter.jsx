import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LETTER } from '../lib/config';

const monthYear = () => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());

/* La lettre telle qu'elle sera remise à l'administration (sans aucune liste de noms). */
export function LetterPaper() {
  return (
    <article className="letter-paper">
      <div className="lp-logo"><img src="./logo.png" alt="ESGIS" /></div>
      <hr className="lp-rule" />
      <p className="lp-date">Lomé, {monthYear()}</p>
      <p className="lp-dest"><b>{LETTER.recipient}</b><br />{LETTER.department}</p>
      <p className="lp-subject"><span>Objet : </span>{LETTER.subject}</p>
      <p>{LETTER.salutation}</p>
      {LETTER.paragraphs.map((t, i) => <p className="lp-par" key={i}>{t}</p>)}
      <p className="lp-sign"><i>{LETTER.signatureLines[0]}</i><br /><b>{LETTER.signatureLines[1]}</b><br /><b>{LETTER.signatureLines[2]}</b></p>
    </article>
  );
}

export function LetterModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', key); };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="letter-overlay no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="La lettre de la classe">
          <motion.div className="letter-box" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} onClick={(e) => e.stopPropagation()}>
            <div className="letter-bar">
              <b>La lettre de la classe</b>
              <button className="btn ghost small" onClick={onClose} aria-label="Fermer"><X size={16} /> Fermer</button>
            </div>
            <div className="letter-scroll"><LetterPaper /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
