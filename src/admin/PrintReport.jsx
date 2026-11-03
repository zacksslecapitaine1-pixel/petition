import React from 'react';
import { FILIERES, LETTER, CLASS_NAME } from '../lib/config';
import { formatPhone } from '../lib/hooks';

export const fmtDate = (d) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);

export function computeStats(rows) {
  const by = (f) => rows.filter((r) => !f || r.filiere === f);
  const mk = (list) => ({ total: list.length, pour: list.filter((r) => r.position === 'pour').length, contre: list.filter((r) => r.position === 'contre').length, hommes: list.filter((r) => r.genre === 'homme').length, femmes: list.filter((r) => r.genre === 'femme').length });
  return { all: mk(by()), ia_bigdata: mk(by('ia_bigdata')), dev_web: mk(by('dev_web')) };
}

const pct = (a, b) => (b ? `${Math.round((a / b) * 100)} %` : '–');

export default function PrintReport({ rows, date, includePhone = false }) {
  const stats = computeStats(rows);
  const dateStr = fmtDate(date);
  return (
    <div className="print-root">
      <div className="sheets">
        {/* ---------- PAGE 1 : LETTRE ---------- */}
        <section className="sheet">
          <div className="p-logo"><img src="./logo.png" alt="ESGIS" /></div>
          <hr className="p-rule" />
          <div className="p-date">Lomé, le {dateStr}</div>
          <div className="p-dest">
            <b>{LETTER.recipient}</b>
            {LETTER.department}
          </div>
          <div className="p-subject"><span>Objet : </span>{LETTER.subject}</div>
          <p style={{ margin: '0 0 3mm' }}>{LETTER.salutation}</p>
          {LETTER.paragraphs.map((t, i) => <p className="par" key={i}>{t}</p>)}
          <div className="p-sign">
            <i>{LETTER.signatureLines[0]}</i><br />
            <b>{LETTER.signatureLines[1]}</b><br />
            <b>{LETTER.signatureLines[2]}</b>
          </div>
        </section>

        {/* ---------- SYNTHÈSE + LISTES ---------- */}
        <section className="sheet">
          <h2 className="p-h">Résultat de la consultation</h2>
          <div className="p-note" style={{ marginTop: 0 }}>{CLASS_NAME} · {rows.length} participant{rows.length > 1 ? 's' : ''} ({stats.all.hommes} homme{stats.all.hommes > 1 ? 's' : ''}, {stats.all.femmes} femme{stats.all.femmes > 1 ? 's' : ''}) · document établi le {dateStr}</div>
          <table className="p-sum">
            <thead><tr><th>Filière</th><th>Participants</th><th>Pour</th><th>Contre</th><th>% Pour</th></tr></thead>
            <tbody>
              {Object.values(FILIERES).map((f) => (
                <tr key={f.id}><td>{f.label}</td><td>{stats[f.id].total}</td><td>{stats[f.id].pour}</td><td>{stats[f.id].contre}</td><td>{pct(stats[f.id].pour, stats[f.id].total)}</td></tr>
              ))}
              <tr className="tot"><td>Total classe</td><td>{stats.all.total}</td><td>{stats.all.pour}</td><td>{stats.all.contre}</td><td>{pct(stats.all.pour, stats.all.total)}</td></tr>
            </tbody>
          </table>

          {Object.values(FILIERES).map((f) => {
            const list = rows.filter((r) => r.filiere === f.id);
            return (
              <div key={f.id}>
                <h3 className="p-h3">{f.label} <small>{stats[f.id].total} étudiant{stats[f.id].total > 1 ? 's' : ''} · {stats[f.id].pour} pour · {stats[f.id].contre} contre</small></h3>
                {list.length === 0 ? (
                  <div className="p-empty">Aucune participation enregistrée pour cette filière.</div>
                ) : (
                  <table className="p-tbl">
                    <thead><tr><th>N°</th><th>Nom et prénom</th><th style={{ textAlign: 'center' }}>Position</th>{includePhone && <th style={{ textAlign: 'center' }}>Téléphone</th>}<th style={{ textAlign: 'center' }}>Signature</th></tr></thead>
                    <tbody>
                      {list.map((r) => (
                        <tr key={r.id}>
                          <td className="n">{r.numero}</td>
                          <td><b>{r.nom}</b> {r.prenom}</td>
                          <td className={`p-pos ${r.position}`}>{r.position.toUpperCase()}</td>
                          {includePhone && <td className="tel">{formatPhone(r.telephone)}</td>}
                          <td className="sg"><img src={r.signature} alt="" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
          <div className="p-foot"><div>Le délégué de classe</div><div>Cachet et visa de l’administration</div></div>
        </section>
      </div>
    </div>
  );
}
