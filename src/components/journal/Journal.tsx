import type { Dict } from '../../i18n';
import type { LogEntry } from '../../types';
import { reactions } from '../../data/reactions';
import { classify } from '../../engine/identification';

export function Journal({ t, log, onRepeat }: { t: Dict; log: LogEntry[]; onRepeat?: (ion: LogEntry['ion']) => void }) {
  if (!log.length) return <p className="neg">{t.empty}</p>;
  const cls = classify(log);
  return (
    <div className="tablewrap">
    <table>
      <thead><tr><th>{t.test}</th><th>{t.obs}</th><th>{t.result}</th>{onRepeat && <th><span className="sr">{t.repeat}</span></th>}</tr></thead>
      <tbody>
        {log.map((e) => {
          const c = cls.get(e.ion) ?? 'negative';
          return (
            <tr key={e.ion}>
              <td>{reactions[e.ion].ion}<br /><small>{reactions[e.ion].reagent}</small></td>
              <td>{e.observation}</td>
              <td className={c === 'positive' ? 'pos' : c === 'uncertain' ? 'unc' : 'neg'}>{t[c]}</td>
              {onRepeat && <td><button className="mini" onClick={() => onRepeat(e.ion)} title={t.repeat} aria-label={`${t.repeat}: ${reactions[e.ion].ion}`}>↻</button></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
