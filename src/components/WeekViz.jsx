import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Coffee } from 'lucide-react';

// L'axe vertical couvre 7h30 → 18h00 (10,5 h)
const SPAN = 10.5;
const pct = (h) => ((h - 7.5) / SPAN) * 100;
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const EXTRA = { 1: true, 3: true }; // mardi et jeudi : cours prolongés jusqu'à 17h dans l'exemple
const HOURS = [8, 10, 12, 14, 16, 18];

export default function WeekViz({ mode = 'now', title }) {
  const proposed = mode === 'new';
  return (
    <div className="week">
      <div className="week-head">
        <b style={{ fontFamily: 'var(--font-h)', fontSize: 15 }}>{title || 'Notre semaine'}</b>
        <AnimatePresence mode="wait">
          <motion.span key={mode} className={`tag ${proposed ? 'new' : 'now'}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25 }}>
            {proposed ? 'Notre proposition' : 'Aujourd’hui'}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="week-grid">
        <div className="hours" aria-hidden="true">
          <div style={{ position: 'relative', height: '100%', minHeight: 190 }}>
            {HOURS.map((h) => (
              <span key={h} style={{ position: 'absolute', right: 0, top: `${pct(h)}%`, transform: 'translateY(-50%)' }}>
                {h}h
              </span>
            ))}
          </div>
        </div>

        {DAYS.map((d, i) => {
          const isSat = i === 5;
          return (
            <div className="day" key={d}>
              <div className="day-name" style={isSat ? { color: 'var(--gold)' } : undefined}>{d}</div>
              <div className="day-body">
                {/* Cours du matin (7h30 – 14h) */}
                {!isSat && (
                  <motion.div className="blk am" style={{ top: 0, height: `${pct(14)}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 140, damping: 18 }} />
                )}
                {isSat && (
                  <AnimatePresence>
                    {!proposed && (
                      <motion.div key="sat" className="blk sat" style={{ top: 0, height: `${pct(14)}%`, outline: '2px solid rgba(242,196,109,.7)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -90, y: 30, scale: 0.55, rotate: -8 }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
                        Cours
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                {isSat && (
                  <AnimatePresence>
                    {proposed && (
                      <motion.div key="free" className="free" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 160, damping: 14 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}>
                          <Sun size={26} />
                        </motion.div>
                        <Coffee size={18} />
                        <span>Libre !</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                {/* Prolongation de l'après-midi */}
                {EXTRA[i] && (
                  <AnimatePresence>
                    {proposed && (
                      <motion.div key="pm" className="blk pm" style={{ top: `${pct(14)}%`, height: `${pct(17) - pct(14)}%`, transformOrigin: 'top' }}
                        initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 140, damping: 15 }}>
                        +3h
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="week-foot">
        <span className="legend"><i style={{ background: '#c8243e' }} /> Cours actuels (7h30 – 14h)</span>
        {proposed ? (
          <span className="legend"><i style={{ background: '#f2c46d' }} /> Cours déplacés (jusqu’à 17h–18h)</span>
        ) : (
          <span className="legend"><i style={{ background: '#6b5a56', outline: '1px solid #f2c46d' }} /> Cours du samedi</span>
        )}
      </div>
    </div>
  );
}
