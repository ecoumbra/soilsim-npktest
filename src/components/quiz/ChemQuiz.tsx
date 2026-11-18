import { useState } from 'react';
import type { Dict } from '../../i18n';
import type { Fertilizer, IonId, LogEntry } from '../../types';
import { IONS } from '../../data/analyticalMatrix';
import { fertilizers } from '../../data/fertilizers';
import { reactions } from '../../data/reactions';
import { identify } from '../../engine/identification';
import {
  MAX_POINTS, POINTS, gradeConclusion, gradeIdentification, gradeInterpretation, gradeReagent, gradeSequence, makeIdentificationQuestion,
  makeInterpretationQuestion, makeJustifications, makeLabTask, makeReagentQuestion, mulberry32, runTest,
  type Graded, type IdentificationQuestion, type InterpretationQuestion, type Justification, type ReagentQuestion, type Rng, type SequenceGrade,
} from '../../engine/quiz';
import { Journal } from '../journal/Journal';

// TODO(en): тексти завдань і пояснень поки що лише українською (хімічні формули не перекладаються).
type Step = 'intro' | 'reagent' | 'interp' | 'ident' | 'lab' | 'conclusion' | 'done';
interface Session { a: ReagentQuestion; b: InterpretationQuestion; c: IdentificationQuestion; sample: Fertilizer; no: number; rng: Rng }
type Key = 'reagent' | 'interpretation' | 'identification' | 'conclusion';

const TITLES: Record<Exclude<Step, 'intro' | 'done'>, string> = {
  reagent: `Тип 1. Визначення реактиву (${POINTS.reagent} бал)`,
  interp: `Тип 2. Інтерпретація реакції (${POINTS.interpretation} бали)`,
  ident: `Тип 3. Встановлення добрива (${POINTS.identification} бали)`,
  lab: `Тип 4. Віртуальна лабораторна задача (послідовність — ${POINTS.sequence} бали)`,
  conclusion: `Тип 4. Науково обґрунтований висновок (${POINTS.conclusion} бал)`,
};
const NUM: Record<string, number> = { reagent: 1, interp: 2, ident: 3, lab: 4, conclusion: 4 };

export function ChemQuiz({ t }: { t: Dict }) {
  const [s, setS] = useState<Session | null>(null);
  const [step, setStep] = useState<Step>('intro');
  const [graded, setGraded] = useState<Partial<Record<Key, Graded>>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [dLog, setDLog] = useState<LogEntry[]>([]);
  const [seq, setSeq] = useState<SequenceGrade | null>(null);
  const [just, setJust] = useState<Justification[]>([]);
  const [ans, setAns] = useState(fertilizers[0].id);
  const [jid, setJid] = useState<string | null>(null);

  const start = () => {
    const rng = mulberry32(Math.floor(Math.random() * 2 ** 31));
    setS({ a: makeReagentQuestion(rng), b: makeInterpretationQuestion(rng), c: makeIdentificationQuestion(rng), sample: makeLabTask(rng).sample, no: 1 + Math.floor(rng() * 98), rng });
    setGraded({}); setPicked(null); setDLog([]); setSeq(null); setJust([]); setJid(null); setAns(fertilizers[0].id); setStep('reagent');
  };
  const answer = (key: Key, value: string, g: Graded) => { if (picked !== null) return; setPicked(value); setGraded((p) => ({ ...p, [key]: g })); };
  const next = (to: Step) => { setPicked(null); setStep(to); };
  const earned = (Object.values(graded) as Graded[]).reduce((a, g) => a + g.points, 0) + (seq?.points ?? 0);
  const cls = (v: string, ok: boolean) => (picked === null ? '' : ok ? ' ok' : v === picked ? ' bad' : '');

  if (step === 'intro' || !s) {
    return (
      <section className="card">
        <div className="sec-head">
          <h3>{t.quizChem}</h3>
          <span className="badge low">МАКС. {MAX_POINTS} БАЛІВ</span>
        </div>
        <p>Контрольне завдання складається з чотирьох типів задач:</p>
        <table className="qtable"><tbody>
          <tr><td>Визначення реактиву</td><td>{POINTS.reagent} б.</td></tr>
          <tr><td>Інтерпретація реакції</td><td>{POINTS.interpretation} б.</td></tr>
          <tr><td>Встановлення добрива за результатами</td><td>{POINTS.identification} б.</td></tr>
          <tr><td>Віртуальна задача: послідовність операцій</td><td>{POINTS.sequence} б.</td></tr>
          <tr><td>Науково обґрунтований висновок</td><td>{POINTS.conclusion} б.</td></tr>
        </tbody></table>
        <p>Наприкінці буде показано не лише бал, а й розбір помилок із поясненням хімічної суті.</p>
        <button className="primary" onClick={start}>Почати →</button>
      </section>
    );
  }

  const header = step !== 'done' && (
    <div className="row" style={{ marginBottom: 10 }}>
      <span className="badge">Завдання {NUM[step]} з 4</span>
      <span className="badge low">Набрано: {earned} з {MAX_POINTS}</span>
    </div>
  );
  const fb = (g?: Graded) => g && picked !== null && <div className={`fb${g.ok ? '' : ' bad'}`}>{g.ok ? '✓ ' : '✗ '}{g.explanation}</div>;

  if (step === 'reagent') {
    const g = graded.reagent;
    return (
      <section className="card">{header}<h3>{TITLES.reagent}</h3>
        <p>Оберіть реактив для виявлення йона <b>{reactions[s.a.ion].ion}</b>:</p>
        {s.a.options.map((o) => <button key={o} className={`opt${cls(o, o === s.a.ion)}`} onClick={() => answer('reagent', o, gradeReagent(s.a, o))}>{reactions[o].reagent}</button>)}
        {fb(g)}{picked !== null && <button className="primary" onClick={() => next('interp')}>Далі →</button>}
      </section>
    );
  }
  if (step === 'interp') {
    const g = graded.interpretation;
    return (
      <section className="card">{header}<h3>{TITLES.interp}</h3>
        <p>{s.b.scenario}</p><p>Який йон виявлено?</p>
        {s.b.options.map((o) => <button key={o} className={`opt${cls(o, o === s.b.ion)}`} onClick={() => answer('interpretation', o, gradeInterpretation(s.b, o))}>{reactions[o].ion}</button>)}
        {fb(g)}{picked !== null && <button className="primary" onClick={() => next('ident')}>Далі →</button>}
      </section>
    );
  }
  if (step === 'ident') {
    const g = graded.identification;
    return (
      <section className="card">{header}<h3>{TITLES.ident}</h3>
        <p>Результати досліджень невідомого мінерального добрива:</p>
        <table className="qtable"><tbody>
          {s.c.results.map((r) => (
            <tr key={r.ion}><td>{reactions[r.ion].ion}<br /><small className="note">{reactions[r.ion].reagent}</small></td><td className={r.positive ? 'pos' : 'neg'}>{r.positive ? t.positive : t.negative}</td></tr>
          ))}
        </tbody></table>
        <p>Яке це добриво?</p>
        {s.c.options.map((id) => {
          const f = fertilizers.find((x) => x.id === id) as Fertilizer;
          return <button key={id} className={`opt${cls(id, id === s.c.sample.id)}`} onClick={() => answer('identification', id, gradeIdentification(s.c, id))}>{f.name} — {f.formula}</button>;
        })}
        {fb(g)}{picked !== null && <button className="primary" onClick={() => next('lab')}>Далі →</button>}
      </section>
    );
  }
  if (step === 'lab') {
    const finish = () => {
      setSeq(gradeSequence(dLog, s.sample));
      const st = identify(dLog).status;
      if (st === 'unique' || st === 'indistinguishable') { setJust(makeJustifications(dLog, s.rng)); next('conclusion'); }
      else { setGraded((p) => ({ ...p, conclusion: gradeConclusion(ans, 'none', s.sample, dLog) })); next('done'); }
    };
    return (
      <section className="card">{header}<h3>{TITLES.lab}</h3>
        <p>Зразок № {String(s.no).padStart(2, '0')} — невідоме добриво з бази. Самостійно побудуйте послідовність досліджень: результат кожного визначає хімічна модель. Не можна визначати добриво за однією реакцією.</p>
        <div className="theory-grid" style={{ marginBottom: 12 }}>
          {IONS.filter((i) => !dLog.some((e) => e.ion === i)).map((i: IonId) => (
            <button key={i} className="opt" style={{ margin: 0 }} title={reactions[i].hazardNote} onClick={() => setDLog((l) => [...l, runTest(i, s.sample)])}>
              <b>{reactions[i].ion}</b><br /><small className="note">{reactions[i].reagent}</small>
            </button>
          ))}
        </div>
        <Journal t={t} log={dLog} />
        <p style={{ marginBottom: 0 }}>
          <button className="primary" disabled={dLog.length === 0} onClick={finish}>Завершити дослідження →</button>
        </p>
      </section>
    );
  }
  if (step === 'conclusion') {
    const done = () => { if (jid) { setGraded((p) => ({ ...p, conclusion: gradeConclusion(ans, jid, s.sample, dLog) })); next('done'); } };
    return (
      <section className="card">{header}<h3>{TITLES.conclusion}</h3>
        <Journal t={t} log={dLog} />
        <p><label><b>{t.answer}:</b>{' '}<select value={ans} onChange={(e) => setAns(e.target.value)}>
          {fertilizers.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.formula}</option>)}
        </select></label></p>
        <p>Яке обґрунтування відповідає вашим результатам?</p>
        {just.map((j) => <button key={j.id} className={`opt${jid === j.id ? ' ok' : ''}`} onClick={() => setJid(j.id)}>{j.text}</button>)}
        <p style={{ marginBottom: 0 }}>
          <button className="primary" disabled={!jid} onClick={done}>Підтвердити висновок →</button>
        </p>
      </section>
    );
  }

  const rows: [string, number, number][] = [
    ['Визначення реактиву', graded.reagent?.points ?? 0, POINTS.reagent],
    ['Інтерпретація реакції', graded.interpretation?.points ?? 0, POINTS.interpretation],
    ['Встановлення добрива', graded.identification?.points ?? 0, POINTS.identification],
    ['Послідовність операцій', seq?.points ?? 0, POINTS.sequence],
    ['Обґрунтований висновок', graded.conclusion?.points ?? 0, POINTS.conclusion],
  ];
  const mistakes: [string, string][] = [];
  (['reagent', 'interpretation', 'identification', 'conclusion'] as Key[]).forEach((k, i) => {
    const g = graded[k];
    if (g && !g.ok) mistakes.push([['Визначення реактиву', 'Інтерпретація реакції', 'Встановлення добрива', 'Висновок'][i], g.explanation]);
  });
  seq?.notes.forEach((n) => mistakes.push(['Послідовність операцій', n]));
  return (
    <section className="card">
      <div className="sec-head">
        <h3>Результат: {earned} з {MAX_POINTS} балів</h3>
        <span className={`badge ${earned >= MAX_POINTS * 0.8 ? 'low' : 'medium'}`}>ПІДСУМОК</span>
      </div>
      <table className="qtable"><tbody>{rows.map(([n, p, m]) => <tr key={n}><td>{n}</td><td className={p === m ? 'pos' : 'unc'}>{p} / {m}</td></tr>)}</tbody></table>
      <p>У віртуальній задачі зразком було: <b>{s.sample.name}</b> ({s.sample.formula}).</p>
      <h3>Розбір помилок</h3>
      {mistakes.length ? mistakes.map(([h, m], i) => <div key={i} className="fb bad"><b>{h}.</b> {m}</div>) : <p className="pos">Помилок немає.</p>}
      <button className="primary" onClick={start}>Пройти знову ↻</button>
    </section>
  );
}