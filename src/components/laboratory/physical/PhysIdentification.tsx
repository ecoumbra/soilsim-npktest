import { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import type { Dict } from '../../../i18n';
import { fertilizers } from '../../../data/fertilizers';
import { candidatesAfter, testKey, type PhysEntry } from '../../../engine/physicalQuiz';
import { LAB_IDS, checkPhysAnswer, identifyPhys, labLabel, labText, resultWord } from '../../../engine/physicalLab';

interface Props { t: Dict; sample: string; no: number; log: PhysEntry[]; onLab: () => void }
const fert = (id: string) => fertilizers.find((f) => f.id === id)!;

/** Ідентифікація за результатами фізичних тестів (аналог IdentificationPanel). */
export function PhysIdentification({ t, sample, no, log, onLab }: Props) {
  const [answer, setAnswer] = useState(LAB_IDS[0]);
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null);
  const r = identifyPhys(log);
  const cands = candidatesAfter(log);
  return (
    <section className="card">
      <div className="sec-head">
        <SearchCheck size={20} className="sec-ico" aria-hidden="true" />
        <h3>{t.sample} {String(no).padStart(2, '0')} · {t.labPhys}</h3>
        <span className="badge">ІДЕНТИФІКАЦІЯ</span>
      </div>

      {log.length === 0 ? <p className="neg">{t.empty}</p> : (
        <div className="tablewrap">
          <table>
            <thead><tr><th>{t.test}</th><th>{t.obs}</th><th>{t.result}</th></tr></thead>
            <tbody>{log.map((e) => <tr key={testKey(e.test)}><td>{labLabel(e.test)}</td><td>{labText(e)}</td><td>{resultWord(e)}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <small className="note">Кандидати за результатами досліджень:</small>
        <div className="chips">
          {LAB_IDS.map((id) => (
            <span key={id} className={`cand ${cands.includes(id) ? 'in' : 'out'}`}>
              {fert(id).name}
            </span>
          ))}
        </div>
      </div>

      <div className="msg">{r.status === 'unique' ? t.unique : t.insufficient}</div>

      <div className="row" style={{ justifyContent: 'flex-start', marginTop: 14 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <b>{t.answer}:</b>
          <select value={answer} onChange={(e) => { setAnswer(e.target.value); setVerdict(null); }}>
            {LAB_IDS.map((id) => <option key={id} value={id}>{fert(id).name} — {fert(id).formula}</option>)}
          </select>
        </label>
        <button
          className="primary"
          disabled={r.status !== 'unique'}
          onClick={() => {
            const c = checkPhysAnswer(answer, sample, log);
            setVerdict(c === 'correct' ? 'correct' : 'wrong');
          }}
        >
          {t.check}
        </button>
      </div>

      {verdict && (
        <div className={`fb${verdict === 'correct' ? '' : ' bad'}`}>
          {verdict === 'correct' ? `✓ ${t.correct}` : `✗ ${t.wrong} ${fert(sample).name} (${fert(sample).formula}).`}
        </div>
      )}

      <p style={{ marginTop: 16, marginBottom: 0 }}>
        <button onClick={onLab}>← {t.toLab}</button>
      </p>
    </section>
  );
}