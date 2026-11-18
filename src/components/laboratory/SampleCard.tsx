import type { Dict } from '../../i18n';
import type { LogEntry } from '../../types';
import { IONS } from '../../data/analyticalMatrix';
import { reactions } from '../../data/reactions';
import { classify } from '../../engine/identification';

/** Картка досліджуваного зразка: номер і статус проведених тестів. */
export function SampleCard({ t, attempt, log }: { t: Dict; attempt: number; log: LogEntry[] }) {
  const cls = classify(log);
  const mark = { positive: ' +', negative: ' −', uncertain: ' ?' } as const;
  return (
    <div className="samplecard">
      <div className="sc-head"><b>{t.sample} {String(attempt).padStart(2, '0')}</b><small>{t.unknownSample}</small></div>
      <div className="sc-chips">
        {IONS.map((i) => {
          const c = cls.get(i);
          return <span key={i} className={`sc-chip ${c ?? 'todo'}`} title={reactions[i].name}>{reactions[i].ion.split(' ')[0]}{c ? mark[c] : ''}</span>;
        })}
      </div>
    </div>
  );
}
