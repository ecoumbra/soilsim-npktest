import type { Dict } from '../../i18n';
import type { ReagentId } from '../../types';
import { reagents } from '../../data/reactions';
import { Modal } from './Modal';

const LEVEL = { low: 'низька', medium: 'середня', high: 'висока' } as const;

/** Правила безпеки: загальні правила + таблиця небезпеки реактивів (будується з бази reactions.ts). */
export function SafetyDialog({ t, open, onClose }: { t: Dict; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={t.safety} wide>
      <ul className="plain">{t.safetyText.split('\n').map((l) => <li key={l}>{l.replace(/^•\s*/, '')}</li>)}</ul>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Реактив</th><th>Небезпека</th><th>Примітка</th></tr></thead>
          <tbody>
            {(Object.keys(reagents) as ReagentId[]).map((r) => (
              <tr key={r}><td>{reagents[r].label}</td><td><span className={`badge ${reagents[r].hazard}`}>{LEVEL[reagents[r].hazard]}</span></td><td>{reagents[r].note || '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">Усі експерименти в AgroSim віртуальні. Програма не є інструкцією для самостійного виконання небезпечних реакцій: у реальній лабораторії працюйте лише під наглядом викладача та з необхідним обладнанням.</p>
    </Modal>
  );
}
