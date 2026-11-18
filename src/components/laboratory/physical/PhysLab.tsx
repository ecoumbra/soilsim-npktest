import { useEffect, useRef, useState } from 'react';
import type { Dict } from '../../../i18n';
import { physical } from '../../../data/physicalProperties';
import { ALL_TESTS, RH_LEVELS, SOL_MASSES, candidatesAfter, runPhysTest, testKey, type PhysEntry, type PhysTest } from '../../../engine/physicalQuiz';
import {
  LAB_IDS, PROPERTY_LABEL, checkTestForTarget, gateGuided, labGrams, labLabel, labText, resultWord, suggestNext, type PhysMode, type PhysProperty,
} from '../../../engine/physicalLab';
import { fertilizers } from '../../../data/fertilizers';
import { PhysScene } from './PhysScene';
import { RUN_MS, type Run, type SceneRuns } from './anim';
import './phys.css';

interface Props {
  t: Dict; sample: string; no: number; attempt: number; log: PhysEntry[];
  onAdd: (e: PhysEntry) => void; onNewSample: () => void; onClearLog: () => void; onIdent: () => void;
}
const name = (id: string) => fertilizers.find((f) => f.id === id)?.name ?? id;
const TARGETS: PhysProperty[] = ['look', 'solubility', 'humidity', 'ph'];

export function PhysLab({ t, sample, no, attempt, log, onAdd, onNewSample, onClearLog, onIdent }: Props) {
  const [mode, setMode] = useState<PhysMode>('guided');
  const [target, setTarget] = useState<PhysProperty | null>(null);
  const [runs, setRuns] = useState<SceneRuns>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Оберіть дослідження. Усі експерименти віртуальні.');
  const timer = useRef<number>(0);
  const pending = useRef<PhysEntry | null>(null);
  const addRef = useRef(onAdd);
  addRef.current = onAdd;
  useEffect(() => () => { window.clearTimeout(timer.current); if (pending.current) { addRef.current(pending.current); pending.current = null; } }, []);

  const done = new Set(log.map((e) => testKey(e.test)));
  const sug = mode === 'guided' ? suggestNext(log) : null;
  const next = sug?.test ?? null;
  const cands = candidatesAfter(log);
  const isNext = (x: PhysTest) => !!next && testKey(next) === testKey(x);

  const doTest = (test: PhysTest, repeat = false) => {
    if (busy || (!repeat && done.has(testKey(test)))) return;
    const gate = repeat ? { ok: true as const } : mode === 'guided' ? gateGuided(log, test) : checkTestForTarget(target, test);
    if (!gate.ok) { setMessage(gate.reason); return; }
    const entry = runPhysTest(test, sample);
    const key = Date.now();
    const p = physical[sample];
    let run: Run; let slot: keyof SceneRuns; let total: number;
    if (test.kind === 'solubility') { slot = 'sol'; total = RUN_MS.sol; run = { kind: 'sol', key, grams: labGrams(test), dissolves: !!entry.positive, s10: (p.solubility20 as number) / 10 }; }
    else if (test.kind === 'humidity') { slot = 'rh'; total = RUN_MS.rh; run = { kind: 'rh', key, rh: test.rh, absorbs: !!entry.positive }; }
    else if (test.kind === 'ph') { slot = 'ph'; total = RUN_MS.ph; run = { kind: 'ph', key, acidic: !!entry.positive }; }
    else { slot = 'look'; total = RUN_MS.look; run = { kind: 'look', key }; }
    setRuns((r) => ({ ...r, [slot]: run }));
    setBusy(true);
    setMessage(`${labLabel(test)} …`);
    pending.current = entry;
    timer.current = window.setTimeout(() => { onAdd(entry); pending.current = null; setMessage(labText(entry)); setBusy(false); }, total + 250);
  };
  const clear = () => { if (!busy) { setRuns({}); setMessage('Стіл очищено. Оберіть дослідження.'); } };
  const changeMode = (m: PhysMode) => { if (!busy) { setMode(m); setTarget(null); } };
  const btn = (x: PhysTest, label: string) => (
    <button key={testKey(x)} className={`${done.has(testKey(x)) ? 'done' : ''}${isNext(x) && !done.has(testKey(x)) ? ' hl' : ''}`} disabled={busy} onClick={() => doTest(x)} aria-label={labLabel(x)}>
      {done.has(testKey(x)) ? '✓ ' : ''}{label}
    </button>
  );
  const look: PhysTest = { kind: 'look' }, ph: PhysTest = { kind: 'ph' };

  return (
    <div className="lab">
      <section className="bench">
        <div className="guide" role="status" aria-live="polite" data-free={mode === 'free' || undefined}>
          {mode === 'guided' && sug ? (
            <>
              <b>{sug.test ? `${t.nextStep}: ${labLabel(sug.test)}` : t.physDone}</b>
              <small>{sug.test ? `${t.why}: ${sug.reason}` : sug.reason}</small>
            </>
          ) : <small>{t.freeHint}</small>}
        </div>
        <div className="row modebar">
          <span role="group" aria-label="Режим" className="seg">
            <button aria-pressed={mode === 'guided'} onClick={() => changeMode('guided')}>{t.modeGuided}</button>
            <button aria-pressed={mode === 'free'} onClick={() => changeMode('free')}>{t.modeFree}</button>
          </span>
          {mode === 'free' && (
            <label>{t.target}:{' '}
              <select value={target ?? ''} onChange={(e) => setTarget(e.target.value === '' ? null : (e.target.value as PhysProperty))}>
                <option value="">{t.noTarget}</option>
                {TARGETS.map((x) => <option key={x} value={x}>{PROPERTY_LABEL[x]}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="samplecard">
          <div className="sc-head"><b>{t.sample} {String(no).padStart(2, '0')}</b><small>{t.unknownSample}</small></div>
          <div className="sc-chips"><span className="sc-chip todo">{log.length} / {ALL_TESTS.length}</span></div>
        </div>

        <PhysScene sample={sample} no={no} runs={runs} />
        <div className="msg" role="status">{message}</div>

        <div className="phys-tests">
          <div className="phys-group"><b>🔍 Зовнішній вигляд</b><div className="btns">{btn(look, 'Лупа')}</div></div>
          <div className="phys-group"><b>⚖ Розчинність — наважка у 10 мл води, 20 °C</b>
            <div className="btns">{SOL_MASSES.map((g) => btn({ kind: 'solubility', grams: g }, `${g / 10} г`))}</div></div>
          <div className="phys-group"><b>💧 Гігроскопічність — камера вологості, 30 °C</b>
            <div className="btns">{RH_LEVELS.map((r) => btn({ kind: 'humidity', rh: r }, `RH ${r} %`))}</div></div>
          <div className="phys-group"><b>🧪 Кислотність 1 % розчину</b><div className="btns">{btn(ph, 'pH-папірець')}</div></div>
        </div>
        <div className="row"><button onClick={clear} disabled={busy}>Очистити стіл</button><button onClick={onNewSample} disabled={busy}>{t.newSample} → {String(attempt + 1).padStart(2, '0')}</button></div>
      </section>

      <section className="card">
        <h3>{t.journal}</h3>
        {log.length === 0 ? <p className="neg">{t.empty}</p> : (
          <div className="tablewrap"><table>
            <thead><tr><th>{t.test}</th><th>{t.obs}</th><th>{t.result}</th><th><span className="sr">{t.repeat}</span></th></tr></thead>
            <tbody>{log.map((e) => <tr key={testKey(e.test)}><td>{labLabel(e.test)}</td><td>{labText(e)}</td><td className={e.positive === null ? 'neg' : 'pos'}>{resultWord(e)}</td><td><button className="mini" disabled={busy} onClick={() => doTest(e.test, true)} title={t.repeat} aria-label={`${t.repeat}: ${labLabel(e.test)}`}>↻</button></td></tr>)}</tbody>
          </table></div>
        )}
        {mode === 'guided' && log.length > 0 && (
          <><small>Можливі добрива:</small><div className="chips">{LAB_IDS.map((id) => <span key={id} className={`cand ${cands.includes(id) ? 'in' : 'out'}`}>{name(id)}</span>)}</div></>
        )}
        <div className="row"><button onClick={onClearLog}>{t.clear}</button><button className="primary" onClick={onIdent}>{t.toIdent} →</button></div>
        <p style={{ fontSize: '.8rem', color: 'var(--mu)' }}>Лабораторний масштаб 1:10: наважка у 10 мл води відповідає розчинності у г на 100 мл з довідкових таблиць. Колір — ненадійна ознака, тому огляд зразок не виключає.</p>
      </section>
    </div>
  );
}
