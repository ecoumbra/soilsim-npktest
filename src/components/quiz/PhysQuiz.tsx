import { useState } from 'react';
import type { Dict } from '../../i18n';
import type { Fertilizer } from '../../types';
import { fertilizers } from '../../data/fertilizers';
import { LAB_POOL, physical } from '../../data/physicalProperties';
import { mulberry32, type Graded, type Rng } from '../../engine/quiz';
import {
  ALL_TESTS, PHYS_MAX, PHYS_POINTS, candidatesAfter, fmt, gradePhysConclusion, gradePhysSequence, gradeProperty, gradeSolubility, gradeStorage,
  makePhysJustifications, makePhysTask, makePropertyQuestion, makeSolubilityQuestion, makeStorageQuestion, runPhysTest, testKey, testLabel,
  type PhysEntry, type PhysJustification, type PhysSequenceGrade, type PhysTest, type PropertyQuestion, type SolubilityQuestion, type StorageQuestion,
} from '../../engine/physicalQuiz';

// TODO(en): тексти завдань і пояснень поки що лише українською.
type Step = 'intro' | 'prop' | 'store' | 'sol' | 'lab' | 'concl' | 'done';
type Key = 'property' | 'storage' | 'solubility' | 'conclusion';
interface Session { a: PropertyQuestion; b: StorageQuestion; c: SolubilityQuestion; sample: string; no: number; rng: Rng }
const fert = (id: string) => fertilizers.find((f) => f.id === id) as Fertilizer;
const TITLES = {
  prop: `Завдання 1. Властивості → добриво (${PHYS_POINTS.property} бали)`,
  store: `Завдання 2. Гігроскопічність і зберігання (${PHYS_POINTS.storage} бали)`,
  sol: `Завдання 3. Розрахунок розчинності (${PHYS_POINTS.solubility} бали)`,
  lab: `Завдання 4. Віртуальна лабораторія: послідовність тестів (${PHYS_POINTS.sequence} бали)`,
  concl: `Завдання 4. Висновок (${PHYS_POINTS.conclusion} бали)`,
};
const NUM: Record<string, number> = { prop: 1, store: 2, sol: 3, lab: 4, concl: 4 };

export function PhysQuiz({ t }: { t: Dict }) {
  const [s, setS] = useState<Session | null>(null);
  const [step, setStep] = useState<Step>('intro');
  const [graded, setGraded] = useState<Partial<Record<Key, Graded>>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [log, setLog] = useState<PhysEntry[]>([]);
  const [seq, setSeq] = useState<PhysSequenceGrade | null>(null);
  const [just, setJust] = useState<PhysJustification[]>([]);
  const [ans, setAns] = useState<string>(LAB_POOL[0]);
  const [jid, setJid] = useState<string | null>(null);

  const start = () => {
    const rng = mulberry32(Math.floor(Math.random() * 2 ** 31));
    setS({ a: makePropertyQuestion(rng), b: makeStorageQuestion(rng), c: makeSolubilityQuestion(rng), sample: makePhysTask(rng).sample, no: 1 + Math.floor(rng() * 98), rng });
    setGraded({}); setPicked(null); setLog([]); setSeq(null); setJust([]); setJid(null); setAns(LAB_POOL[0]); setStep('prop');
  };
  const answer = (key: Key, value: string, g: Graded) => { if (picked !== null) return; setPicked(value); setGraded((p) => ({ ...p, [key]: g })); };
  const next = (to: Step) => { setPicked(null); setStep(to); };
  const earned = (Object.values(graded) as Graded[]).reduce((a, g) => a + g.points, 0) + (seq?.points ?? 0);
  const cls = (v: string, ok: boolean) => (picked === null ? '' : ok ? ' ok' : v === picked ? ' bad' : '');
  const fb = (g?: Graded) => g && picked !== null && <div className={`fb${g.ok ? '' : ' bad'}`}>{g.ok ? '✓ ' : '✗ '}{g.explanation}</div>;
  const header = step !== 'done' && step !== 'intro' && (
    <div className="row" style={{ marginBottom: 10 }}>
      <span className="badge">Завдання {NUM[step]} з 4</span>
      <span className="badge low">Набрано: {earned} з {PHYS_MAX}</span>
    </div>
  );

  if (step === 'intro' || !s) {
    return (
      <section className="card">
        <div className="sec-head">
          <h3>{t.quizPhys}</h3>
          <span className="badge low">МАКС. {PHYS_MAX} БАЛІВ</span>
        </div>
        <p>Тест про фізичні властивості мінеральних добрив. Розчинність подано для 20 °C (г на 100 мл води), гігроскопічність — як критичну відносну вологість (CRH) при 30 °C.</p>
        <table className="qtable"><tbody>
          <tr><td>Властивості → добриво</td><td>{PHYS_POINTS.property} б.</td></tr>
          <tr><td>Гігроскопічність і зберігання</td><td>{PHYS_POINTS.storage} б.</td></tr>
          <tr><td>Розрахунок розчинності</td><td>{PHYS_POINTS.solubility} б.</td></tr>
          <tr><td>Віртуальна лабораторія: послідовність тестів</td><td>{PHYS_POINTS.sequence} б.</td></tr>
          <tr><td>Висновок і його обґрунтування</td><td>{PHYS_POINTS.conclusion} б.</td></tr>
        </tbody></table>
        <p className="unc"><small>Увага: колір і зовнішній вигляд для більшості добрив — ненадійна ознака (KCl буває білим і червонуватим, DAP — від світло-коричневого до чорного), тому в лабораторії такий тест нічого не виключає. Числові дані взято з довідкових джерел і потребують звірки (docs → references).</small></p>
        <button className="primary" onClick={start}>{t.quizStart} →</button>
      </section>
    );
  }

  if (step === 'prop') {
    return (
      <section className="card">{header}<h3>{TITLES.prop}</h3>
        <p>{s.a.text}</p><p>Яке це добриво?</p>
        {s.a.options.map((o) => <button key={o} className={`opt${cls(o, o === s.a.answer)}`} onClick={() => answer('property', o, gradeProperty(s.a, o))}>{fert(o).name} — {fert(o).formula}</button>)}
        {fb(graded.property)}{picked !== null && <button className="primary" onClick={() => next('store')}>Далі →</button>}
      </section>
    );
  }
  if (step === 'store') {
    const q = s.b;
    return (
      <section className="card">{header}<h3>{TITLES.store}</h3>
        <p>{q.mode === 'most' ? 'Яке з добрив найбільш гігроскопічне, тобто починає поглинати вологу з повітря за найнижчої вологості?' : 'Яке з добрив найкраще зберігати у вологому кліматі: воно поглинає вологу лише за найвищої вологості повітря?'}</p>
        {q.options.map((o) => <button key={o} className={`opt${cls(o, o === q.answer)}`} onClick={() => answer('storage', o, gradeStorage(q, o))}>{fert(o).name} — {fert(o).formula}</button>)}
        {fb(graded.storage)}{picked !== null && <button className="primary" onClick={() => next('sol')}>Далі →</button>}
      </section>
    );
  }
  if (step === 'sol') {
    const q = s.c;
    return (
      <section className="card">{header}<h3>{TITLES.sol}</h3>
        <p>Розчинність добрива «{fert(q.id).name}» ({fert(q.id).formula}) при 20 °C становить {fmt(physical[q.id].solubility20 as number)} г на 100 мл води. Яку найбільшу масу добрива можна розчинити в <b>{q.volume} мл</b> води при 20 °C (густина води ≈ 1 г/мл)?</p>
        {q.options.map((o) => <button key={o} className={`opt${cls(String(o), o === q.answer)}`} onClick={() => answer('solubility', String(o), gradeSolubility(q, o))}>{fmt(o)} г</button>)}
        {fb(graded.solubility)}{picked !== null && <button className="primary" onClick={() => next('lab')}>Далі →</button>}
      </section>
    );
  }
  if (step === 'lab') {
    const done = new Set(log.map((e) => testKey(e.test)));
    const run = (tst: PhysTest) => setLog((l) => [...l, runPhysTest(tst, s.sample)]);
    const finish = () => {
      setSeq(gradePhysSequence(log, s.sample));
      if (candidatesAfter(log).length === 1) { setJust(makePhysJustifications(log, s.rng)); next('concl'); }
      else { setGraded((p) => ({ ...p, conclusion: gradePhysConclusion(ans, 'none', s.sample, log) })); next('done'); }
    };
    return (
      <section className="card">{header}<h3>{TITLES.lab}</h3>
        <p>Зразок № {String(s.no).padStart(2, '0')} — одне з добрив: {LAB_POOL.map((id) => fert(id).name).join(', ')}. Установіть, яке саме, найменшою кількістю тестів: кожен тест має звужувати коло добрив. Результат визначає фізична модель.</p>
        <details><summary>Довідкова таблиця (необов’язково)</summary>
          <div className="tablewrap"><table className="qtable"><thead><tr><th>Добриво</th><th>Розчинність, г/100 мл (20 °C)</th><th>CRH, % (30 °C)</th></tr></thead>
            <tbody>{LAB_POOL.map((id) => <tr key={id}><td>{fert(id).name}</td><td>{fmt(physical[id].solubility20 as number)}</td><td>{fmt(physical[id].crh30 as number)}</td></tr>)}</tbody></table></div>
        </details>
        <div className="theory-grid" style={{ marginBottom: 12 }}>
          {ALL_TESTS.filter((x) => !done.has(testKey(x))).map((x) => <button key={testKey(x)} className="opt" style={{ margin: 0 }} onClick={() => run(x)}>{testLabel(x)}</button>)}
        </div>
        {log.length > 0 && (
          <div className="tablewrap" style={{ marginBottom: 12 }}><table><thead><tr><th>Тест</th><th>Спостереження</th></tr></thead>
            <tbody>{log.map((e) => <tr key={testKey(e.test)}><td>{testLabel(e.test)}</td><td className={e.positive === null ? 'unc' : ''}>{e.text}{e.positive === null ? ' (колір не виключає жодного добрива)' : ''}</td></tr>)}</tbody></table></div>
        )}
        <button className="primary" disabled={log.length === 0} onClick={finish}>Завершити дослідження →</button>
      </section>
    );
  }
  if (step === 'concl') {
    const confirm = () => { if (jid) { setGraded((p) => ({ ...p, conclusion: gradePhysConclusion(ans, jid, s.sample, log) })); next('done'); } };
    return (
      <section className="card">{header}<h3>{TITLES.concl}</h3>
        <div className="tablewrap"><table><tbody>{log.map((e) => <tr key={testKey(e.test)}><td>{testLabel(e.test)}</td><td>{e.text}</td></tr>)}</tbody></table></div>
        <p><label><b>{t.answer}:</b>{' '}<select value={ans} onChange={(e) => setAns(e.target.value)}>
          {LAB_POOL.map((id) => <option key={id} value={id}>{fert(id).name} — {fert(id).formula}</option>)}
        </select></label></p>
        <p>Яке обґрунтування відповідає вашим результатам?</p>
        {just.map((j) => <button key={j.id} className={`opt${jid === j.id ? ' ok' : ''}`} onClick={() => setJid(j.id)}>{j.text}</button>)}
        <p style={{ marginBottom: 0 }}>
          <button className="primary" disabled={!jid} onClick={confirm}>Підтвердити висновок →</button>
        </p>
      </section>
    );
  }

  const rows: [string, number, number][] = [
    ['Властивості → добриво', graded.property?.points ?? 0, PHYS_POINTS.property],
    ['Гігроскопічність і зберігання', graded.storage?.points ?? 0, PHYS_POINTS.storage],
    ['Розрахунок розчинності', graded.solubility?.points ?? 0, PHYS_POINTS.solubility],
    ['Послідовність тестів', seq?.points ?? 0, PHYS_POINTS.sequence],
    ['Висновок і обґрунтування', graded.conclusion?.points ?? 0, PHYS_POINTS.conclusion],
  ];
  const mistakes: [string, string][] = [];
  (['property', 'storage', 'solubility', 'conclusion'] as Key[]).forEach((k, i) => {
    const g = graded[k];
    if (g && !g.ok) mistakes.push([['Властивості → добриво', 'Гігроскопічність', 'Розчинність', 'Висновок'][i], g.explanation]);
  });
  seq?.notes.forEach((n) => mistakes.push(['Послідовність тестів', n]));
  return (
    <section className="card">
      <div className="sec-head">
        <h3>Результат: {earned} з {PHYS_MAX} балів</h3>
        <span className={`badge ${earned >= PHYS_MAX * 0.8 ? 'low' : 'medium'}`}>ПІДСУМОК</span>
      </div>
      <table className="qtable"><tbody>{rows.map(([n, p, m]) => <tr key={n}><td>{n}</td><td className={p === m ? 'pos' : 'unc'}>{p} / {m}</td></tr>)}</tbody></table>
      <p>У віртуальній лабораторії зразком було: <b>{fert(s.sample).name}</b> ({fert(s.sample).formula}).</p>
      <h3>Розбір помилок і підказки</h3>
      {mistakes.length ? mistakes.map(([h, m], i) => <div key={i} className="fb bad"><b>{h}.</b> {m}</div>) : <p className="pos">Помилок немає.</p>}
      <button className="primary" onClick={start}>Пройти знову ↻</button>
    </section>
  );
}