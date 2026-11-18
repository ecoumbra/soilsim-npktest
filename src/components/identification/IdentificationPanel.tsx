import { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import type { Dict } from '../../i18n';
import type { Fertilizer, LogEntry } from '../../types';
import { fertilizers } from '../../data/fertilizers';
import { checkAnswer, identify } from '../../engine/identification';
import { Journal } from '../journal/Journal';

interface Props {
  t: Dict;
  sample: Fertilizer;
  attempt: number;
  log: LogEntry[];
  onLab: () => void;
}

export function IdentificationPanel({ t, sample, attempt, log, onLab }: Props) {
  const [answer, setAnswer] = useState(fertilizers[0].id);
  const [verdict, setVerdict] = useState<'correct' | 'acceptable' | 'wrong' | null>(null);
  const r = identify(log);
  const ready = r.status === 'unique' || r.status === 'indistinguishable';
  const candIds = new Set(r.candidates.map((c) => c.id));

  return (
    <section className="card">
      <div className="sec-head">
        <SearchCheck size={20} className="sec-ico" aria-hidden="true" />
        <h3>
          {t.sample} {String(attempt).padStart(2, '0')} · {t.labChem}
        </h3>
        <span className="badge">ІДЕНТИФІКАЦІЯ</span>
      </div>

      <Journal t={t} log={log} />

      <div style={{ marginTop: 12 }}>
        <small className="note">Кандидати за результатами якісних реакцій:</small>
        <div className="chips">
          {fertilizers.map((f) => (
            <span key={f.id} className={`cand ${candIds.has(f.id) ? 'in' : 'out'}`}>
              {f.name}
            </span>
          ))}
        </div>
      </div>

      <div className="msg">
        {t[r.status]}
        {r.status === 'unique' && r.candidates[0].id === 'ur'
          ? ' (Сечовина: підтвердження уреазою — лише теоретична демонстрація.)'
          : ''}
      </div>

      <div className="row" style={{ justifyContent: 'flex-start', marginTop: 14 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <b>{t.answer}:</b>
          <select
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setVerdict(null);
            }}
          >
            {fertilizers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.formula}
              </option>
            ))}
          </select>
        </label>
        <button
          className="primary"
          disabled={!ready}
          onClick={() => setVerdict(checkAnswer(answer, sample, r))}
        >
          {t.check}
        </button>
      </div>

      {verdict && (
        <div className={`fb${verdict === 'wrong' ? ' bad' : ''}`}>
          {verdict === 'correct'
            ? `✓ ${t.correct}`
            : verdict === 'acceptable'
              ? `✓ ${t.acceptable} ${sample.name} (${sample.formula}).`
              : `✗ ${t.wrong} ${sample.name} (${sample.formula}).`}
        </div>
      )}

      <p style={{ marginTop: 16, marginBottom: 0 }}>
        <button onClick={onLab}>← {t.toLab}</button>
      </p>
    </section>
  );
}