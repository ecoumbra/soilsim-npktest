import { useEffect, useRef, useState } from 'react';
import type { Dict } from '../../i18n';
import type { ArchivedTube, Fertilizer, IonId, LogEntry, ReagentId, TubeState } from '../../types';
import { IONS } from '../../data/analyticalMatrix';
import { reactions, reagents } from '../../data/reactions';
import { PROTOCOLS, describeAction, type Action, type LabMode } from '../../engine/protocol';
import { Journal } from '../journal/Journal';
import { TestTube } from './TestTube';
import { Rack } from './Rack';
import { ReagentBottle } from './ReagentBottle';
import { Dropper } from './Dropper';
import { SpiritLamp } from './SpiritLamp';
import { WasteContainer } from './WasteContainer';
import { SampleCard } from './SampleCard';
import { bottles } from './visuals';
import './lab.css';

interface Props {
  t: Dict; sample: Fertilizer; attempt: number; tube: TubeState; message: string; log: LogEntry[]; archive: ArchivedTube[];
  mode: LabMode; target: IonId | null; step: number;
  onMode: (m: LabMode) => void; onTarget: (i: IonId | null) => void;
  onNewSample: () => void; onTake: () => boolean; onReagent: (r: ReagentId) => boolean; onHeat: () => boolean;
  onNewTube: () => void; onPour: () => void; onReplay: () => void; onClearLog: () => void; onIdent: () => void; onRepeat: (ion: IonId) => void;
}

const HOLES = [33, 59]; // % по ширині сцени: ліва й права лунки штатива (центральна — робоча пробірка)

export function Lab(p: Props) {
  const { t, tube, mode, target, step } = p;
  const [drop, setDrop] = useState<{ r: ReagentId; k: number } | null>(null);
  const [heating, setHeating] = useState(false);
  const [pouring, setPouring] = useState(false);
  const [delay, setDelay] = useState(0.8);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((x) => window.clearTimeout(x)), []);
  const later = (f: () => void, ms: number) => { timers.current.push(window.setTimeout(f, ms)); };

  const steps = mode === 'guided' && target ? PROTOCOLS[target] : null;
  const next: Action | null = steps && step < steps.length ? steps[step].action : null;
  const protoDone = !!steps && step >= steps.length;
  const hasEffect = tube.gas || tube.ring || tube.precipitate !== null;
  const busy = pouring;
  // відстань від кінчика піпетки до поверхні рідини (одиниці viewBox піпетки; вивід з геометрії сцени)
  const dropFall = Math.round(9.3 + 0.617 * (106 - 14 * Math.min(tube.reagents.length, 3)) - 2);

  const take = () => { if (!busy) p.onTake(); };
  const reagent = (r: ReagentId) => {
    if (busy) return;
    if (p.onReagent(r)) { setDelay(0.95); setDrop({ r, k: Date.now() }); later(() => setDrop(null), 1700); }
  };
  const heat = () => {
    if (busy) return;
    if (p.onHeat()) { setDelay(1.7); setHeating(true); later(() => setHeating(false), 3800); }
  };
  const replay = () => { setDelay(0.15); p.onReplay(); };
  const pour = () => {
    if (busy) return;
    if (!tube.filled) { p.onPour(); return; }
    setPouring(true);
    later(() => { p.onPour(); setPouring(false); }, 2000);
  };
  const newTube = () => { if (!busy) p.onNewTube(); };

  return (
    <div className="lab">
      <section className="bench">
        <div className="guide" role="status" aria-live="polite" data-free={!steps || undefined}>
          {steps ? (
            <>
              <div className="dots" aria-hidden="true">{steps.map((_, i) => <i key={i} className={i < step ? 'd' : i === step ? 'c' : ''} />)}</div>
              {next ? (
                <>
                  <b>{t.nextStep} ({step + 1}/{steps.length}): {describeAction(next)}</b>
                  <small>{t.why}: {steps[step].purpose}</small>
                </>
              ) : <b>{t.protocolDone}</b>}
            </>
          ) : <small>{t.freeHint}</small>}
        </div>

        <div className="row modebar">
          <span role="group" aria-label="Режим" className="seg">
            <button aria-pressed={mode === 'guided'} onClick={() => p.onMode('guided')}>{t.modeGuided}</button>
            <button aria-pressed={mode === 'free'} onClick={() => p.onMode('free')}>{t.modeFree}</button>
          </span>
          <label>{t.target}:{' '}
            <select value={target ?? ''} onChange={(e) => p.onTarget(e.target.value === '' ? null : (e.target.value as IonId))}>
              {mode === 'free' && <option value="">{t.noTarget}</option>}
              {IONS.map((i) => <option key={i} value={i}>{reactions[i].ion}</option>)}
            </select>
          </label>
        </div>

        <SampleCard t={t} attempt={p.attempt} log={p.log} />

        <div className={`stage${heating ? ' heating' : ''}${pouring ? ' pouring' : ''}`} aria-label="Лабораторний стіл">
          <div className="wall" /><div className="hood"><span><i />AgroSim · {t.sample}{String(p.attempt).padStart(2, '0')}</span><span>🥽 {t.goggles}</span></div><div className="table" /><div className="lampglow" />
          <div className="s-waste"><WasteContainer receiving={pouring} /></div>
          <div className="s-rack"><Rack part="back" /></div>
          {p.archive.map((a, i) => (
            <div key={i} className="s-tube still" style={{ left: `${HOLES[i]}%` }}>
              <TestTube tube={a.tube} still />
              <span className={`tag ${a.positive ? 'pos' : 'neg'}`}>{reactions[a.ion].ion.split(' ')[0]}{a.positive ? ' +' : ' −'}</span>
            </div>
          ))}
          <div className="s-tube active"><TestTube tube={tube} delay={delay} heating={heating} /></div>
          <div className="s-rack front"><Rack part="front" /></div>
          <div className="s-lamp"><SpiritLamp lit={heating} /></div>
          {drop && !heating && <Dropper key={drop.k} color={bottles[drop.r].liquid} fall={dropFall} />}
        </div>

        <div className="msg" role="status">{p.message}</div>

        <div className="row ctrls">
          <button className={`primary${next?.kind === 'take' && !tube.filled ? ' hl' : ''}`} onClick={take} disabled={tube.filled || busy}>{t.take}</button>
          <button className={next?.kind === 'heat' ? 'hl' : ''} onClick={heat} disabled={!tube.filled || busy}>🔥 {t.heat}</button>
          <button onClick={replay} disabled={!hasEffect || busy}>↻ {t.replay}</button>
          <button className={protoDone ? 'hl' : ''} onClick={newTube} disabled={busy}>{t.newTube}</button>
          <button onClick={pour} disabled={busy}>{t.pour}</button>
        </div>

        <div className="shelf">
          {(Object.keys(reagents) as ReagentId[]).map((r) => (
            <ReagentBottle key={r} id={r} label={reagents[r].label} hazard={reagents[r].hazard} note={reagents[r].note}
              disabled={!tube.filled || busy} hl={next?.kind === 'reagent' && next.reagent === r} onClick={() => reagent(r)} />
          ))}
        </div>
        <div className="row"><b>{t.newSample}</b><button onClick={p.onNewSample}>{t.sample}{String(p.attempt + 1).padStart(2, '0')} →</button></div>
      </section>

      <section className="card">
        <h3>{t.journal}</h3>
        <Journal t={t} log={p.log} onRepeat={p.onRepeat} />
        <div className="row">
          <button onClick={p.onClearLog}>{t.clear}</button>
          <button className="primary" onClick={p.onIdent}>{t.toIdent} →</button>
        </div>
      </section>
    </div>
  );
}
