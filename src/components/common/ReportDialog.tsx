import { useState } from 'react';
import type { Dict } from '../../i18n';
import type { Fertilizer, LogEntry } from '../../types';
import type { PhysEntry } from '../../engine/physicalQuiz';
import { chemSection, physSection, reportToText, type ReportData, type ReportSection } from '../../engine/report';
import { useLocalState } from '../../hooks/useLocalState';
import { Modal } from './Modal';

interface Props {
  t: Dict; open: boolean; onClose: () => void;
  chem: { attempt: number; log: LogEntry[]; sample: Fertilizer };
  phys: { no: number; attempt: number; log: PhysEntry[]; sample: string };
}

function Section({ s }: { s: ReportSection }) {
  return (
    <section className="rep-sec">
      <h3>{s.title}</h3>
      {s.rows.length === 0 ? <p className="neg">Досліджень не проведено.</p> : (
        <div className="tablewrap"><table>
          <thead><tr>{s.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{s.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table></div>
      )}
      <p><b>Висновок.</b> {s.verdict}</p>
      {s.answer && <div className={`fb${s.match ? '' : ' bad'}`}>{s.answer} {s.match ? '✓ Ваш результат збігається.' : '✗ Ваш результат не дозволяє підтвердити відповідь.'}</div>}
    </section>
  );
}

/** Звіт про лабораторну роботу: журнали обох лабораторій, висновок, правильна відповідь після завершення; друк і збереження. */
export function ReportDialog({ t, open, onClose, chem, phys }: Props) {
  const [student, setStudent] = useLocalState<string>('student', '');
  const [group, setGroup] = useLocalState<string>('group', '');
  const [revealed, setRevealed] = useState(false);
  const date = new Date().toLocaleDateString('uk-UA');
  const data: ReportData = { student, group, date, revealed, chem, phys };
  const save = () => {
    const url = URL.createObjectURL(new Blob([reportToText(data)], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `AgroSim-звіт-${date.replace(/\./g, '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Modal open={open} onClose={onClose} title={t.report} wide>
      <div className="report">
        <div className="rep-meta">
          <label>Студент <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Прізвище та ім’я" /></label>
          <label>Група <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Група" /></label>
          <span>Дата: {date}</span>
        </div>
        <Section s={chemSection(chem, revealed)} />
        <Section s={physSection(phys, revealed)} />
        {!revealed && <p className="note noprint">Правильна відповідь прихована, доки ви не завершите роботу.</p>}
      </div>
      <div className="row noprint">
        {!revealed
          ? <button className="primary" onClick={() => { if (window.confirm('Завершити роботу й показати правильну відповідь?')) setRevealed(true); }}>Завершити роботу</button>
          : <button onClick={() => setRevealed(false)}>Сховати відповідь</button>}
        <button onClick={() => window.print()}>Друк / PDF</button>
        <button onClick={save}>Зберегти .txt</button>
      </div>
    </Modal>
  );
}
