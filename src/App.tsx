import { useState } from 'react';
import { clearStored, isArray, isPositiveInt, useLocalState } from './hooks/useLocalState';
import {
  AlertTriangle,
  BookOpen,
  ClipboardCheck,
  FileText,
  FlaskConical,
  HelpCircle,
  SearchCheck,
  type LucideIcon,
} from 'lucide-react';
import { SafetyDialog } from './components/common/SafetyDialog';
import { HelpDialog } from './components/common/HelpDialog';
import { ReportDialog } from './components/common/ReportDialog';
import { dict, type Lang } from './i18n';
import { fertilizers } from './data/fertilizers';
import type { ArchivedTube, Fertilizer, IonId, LogEntry, Outcome, ReagentId, TubeState } from './types';
import { advance, checkReagentForIon, type Action, type LabMode } from './engine/protocol';
import { applyHeat, applyReagent, emptyTube, fillTube, replayReaction } from './engine/experimentValidation';
import { Lab } from './components/laboratory/Lab';
import { TheoryView } from './components/reactions/TheoryView';
import { IdentificationPanel } from './components/identification/IdentificationPanel';
import { QuizView } from './components/quiz/QuizView';
import { LabKindSwitch, type LabKind } from './components/laboratory/LabKindSwitch';
import { PhysLab } from './components/laboratory/physical/PhysLab';
import { PhysIdentification } from './components/laboratory/physical/PhysIdentification';
import { LAB_POOL } from './data/physicalProperties';
import { ALL_TESTS, type PhysEntry } from './engine/physicalQuiz';

type Tab = 'theory' | 'lab' | 'ident' | 'quiz';
const pick = (): Fertilizer => fertilizers[Math.floor(Math.random() * fertilizers.length)];
const pickPhys = (): string => LAB_POOL[Math.floor(Math.random() * LAB_POOL.length)];
const newNo = () => 1 + Math.floor(Math.random() * 98);

export default function App() {
  const [lang, setLang] = useLocalState<Lang>('lang', 'uk', (v) => v === 'uk' || v === 'en');
  const [tab, setTab] = useState<Tab>('theory');
  const [sampleId, setSampleId] = useLocalState<string>('sample', () => pick().id, (v) => fertilizers.some((f) => f.id === v));
  const sample: Fertilizer = fertilizers.find((f) => f.id === sampleId) ?? fertilizers[0];
  const [attempt, setAttempt] = useLocalState<number>('attempt', 1, isPositiveInt);
  const [tube, setTube] = useState<TubeState>(emptyTube);
  const [message, setMessage] = useState('');
  const [log, setLog] = useLocalState<LogEntry[]>('log', [], isArray);
  const [mode, setMode] = useState<LabMode>('guided');
  const [target, setTarget] = useState<IonId | null>('NH4');
  const [step, setStep] = useState(0);
  const [archive, setArchive] = useState<ArchivedTube[]>([]);
  const [labKind, setLabKind] = useLocalState<LabKind>('labKind', 'chem', (v) => v === 'chem' || v === 'phys');
  const [welcomed, setWelcomed] = useLocalState<boolean>('welcomed', false);
  const [dialog, setDialog] = useState<'safety' | 'help' | 'report' | null>(null);
  const [physSample, setPhysSample] = useLocalState<string>('physSample', pickPhys, (v) => (LAB_POOL as readonly string[]).includes(v as string));
  const [physNo, setPhysNo] = useLocalState<number>('physNo', newNo, isPositiveInt);
  const [physAttempt, setPhysAttempt] = useLocalState<number>('physAttempt', 1, isPositiveInt);
  const [physLog, setPhysLog] = useLocalState<PhysEntry[]>('physLog', [], isArray);
  const t = dict[lang];

  const apply = (o: Outcome) => {
    setTube(o.tube);
    setMessage(o.message);
    const e = o.entry;
    if (e) setLog((l) => [...l.filter((x) => x.ion !== e.ion), e]);
  };
  const resetTube = () => { setTube(emptyTube()); setMessage(''); setStep(0); };
  /** Поточну пробірку із результатом залишаємо у штативі (до 2 шт.) і беремо нову. */
  const keepAndReset = () => {
    const ion = tube.done[tube.done.length - 1];
    if (ion) {
      const positive = !!log.find((x) => x.ion === ion)?.positive;
      setArchive((a) => [{ tube, ion, positive }, ...a].slice(0, 2));
    }
    resetTube();
  };
  const newSample = () => { setSampleId(pick().id); setAttempt((a) => a + 1); resetTube(); setLog([]); setArchive([]); };
  const changeMode = (m: LabMode) => { setMode(m); if (m === 'guided' && !target) setTarget('NH4'); keepAndReset(); };
  const changeTarget = (i: IonId | null) => { setTarget(i); keepAndReset(); };
  /** Дозволяє дію чи блокує її з поясненням (покроковий протокол / придатність реактиву). */
  const gate = (a: Action): boolean => {
    if (mode === 'guided' && target) {
      const v = advance(target, step, a);
      if (!v.ok) { setMessage(v.reason); return false; }
      setStep(v.next);
      return true;
    }
    if (target && a.kind === 'reagent') {
      const c = checkReagentForIon(target, a.reagent);
      if (!c.ok) { setMessage(c.reason); return false; }
    }
    return true;
  };
  const resetAll = () => {
    if (!window.confirm('Скинути весь прогрес (журнали обох лабораторій, номери зразків)? Дію не можна скасувати.')) return;
    clearStored();
    setLog([]); setPhysLog([]); setAttempt(1); setPhysAttempt(1); setSampleId(pick().id); setPhysSample(pickPhys()); setPhysNo(newNo());
    setArchive([]); resetTube(); setWelcomed(false); setDialog(null);
  };

  const tabs: [Tab, string, LucideIcon][] = [
    ['theory', t.theory, BookOpen],
    ['lab', t.lab, FlaskConical],
    ['ident', t.ident, SearchCheck],
    ['quiz', t.quiz, ClipboardCheck],
  ];

  return (
    <>
      <div className="hero-shell">
        <header className="top">
          <div className="titles">
            <p className="t1">
              <span className="h1-ico" aria-hidden="true"><FlaskConical size={16} /></span>
              <span>{t.tagline}</span>
            </p>
            <h1>AgroSim: {t.subtitle}</h1>
            <p className="t3">{t.course}</p>
          </div>
          <div className="tools">
            <span className="chip">{t.progress}: {labKind === 'chem' ? `${log.length} / 7` : `${physLog.length} / ${ALL_TESTS.length}`}</span>
            <button onClick={() => setDialog('help')}><HelpCircle size={15} /> <span>{t.help}</span></button>
            <button onClick={() => setDialog('report')}><FileText size={15} /> <span>{t.report}</span></button>
            <button className="btn-warn" onClick={() => setDialog('safety')}><AlertTriangle size={15} /> <span>{t.safety}</span></button>
            <button className="btn-lang" onClick={() => setLang(lang === 'uk' ? 'en' : 'uk')} aria-label="Language">{lang === 'uk' ? 'UA' : 'EN'}</button>
          </div>
        </header>
        <nav role="tablist">
          {tabs.map(([k, l, Icon]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
              <Icon size={16} aria-hidden="true" />
              <span>{l}</span>
            </button>
          ))}
        </nav>
      </div>
      <main>
        {!welcomed && (
          <section className="card welcome" role="note">
            <div>
              <b>Вітаємо в AgroSim!</b>
              <span> Почніть із вкладки «{t.theory}», потім проведіть дослідження у «{t.lab}». Ваш прогрес зберігається в цьому браузері автоматично.</span>
            </div>
            <span className="row">
              <button onClick={() => setDialog('help')}>{t.help}</button>
              <button className="primary" onClick={() => setWelcomed(true)}>Зрозуміло</button>
            </span>
          </section>
        )}
        {tab === 'theory' && <TheoryView t={t} onOpenLab={() => { setLabKind('chem'); setTab('lab'); }} onOpenPhysLab={() => { setLabKind('phys'); setTab('lab'); }} />}
        {tab === 'lab' && (
          <>
            <LabKindSwitch t={t} kind={labKind} onChange={setLabKind} />
            {labKind === 'phys' ? (
              <PhysLab t={t} sample={physSample} no={physNo} attempt={physAttempt} log={physLog}
                onAdd={(e) => setPhysLog((l) => [...l.filter((x) => JSON.stringify(x.test) !== JSON.stringify(e.test)), e])}
                onNewSample={() => { setPhysSample(pickPhys()); setPhysNo(newNo()); setPhysAttempt((a) => a + 1); setPhysLog([]); }}
                onClearLog={() => setPhysLog([])} onIdent={() => setTab('ident')} />
            ) : (
              <Lab t={t} sample={sample} attempt={attempt} tube={tube} message={message || t.take} log={log} archive={archive}
                mode={mode} target={target} step={step} onMode={changeMode} onTarget={changeTarget} onNewSample={newSample}
                onTake={() => { if (!gate({ kind: 'take' })) return false; apply(fillTube(tube)); return true; }}
                onReagent={(r: ReagentId) => {
                  if (!gate({ kind: 'reagent', reagent: r })) return false;
                  const o = applyReagent(tube, r, sample); apply(o); return o.tube !== tube || r === 'HCl';
                }}
                onHeat={() => { if (!gate({ kind: 'heat' })) return false; const o = applyHeat(tube, sample); apply(o); return o.tube !== tube; }}
                onNewTube={keepAndReset} onPour={resetTube} onReplay={() => setTube(replayReaction(tube))}
                onClearLog={() => setLog([])} onIdent={() => setTab('ident')}
                onRepeat={(ion: IonId) => { setMode('guided'); setTarget(ion); keepAndReset(); }} />
            )}
          </>
        )}
        {tab === 'ident' && (
          <>
            <LabKindSwitch t={t} kind={labKind} onChange={setLabKind} />
            {labKind === 'phys'
              ? <PhysIdentification t={t} sample={physSample} no={physNo} log={physLog} onLab={() => setTab('lab')} />
              : <IdentificationPanel t={t} sample={sample} attempt={attempt} log={log} onLab={() => setTab('lab')} />}
          </>
        )}
        {tab === 'quiz' && <QuizView t={t} />}
      </main>
      <SafetyDialog t={t} open={dialog === 'safety'} onClose={() => setDialog(null)} />
      <HelpDialog t={t} open={dialog === 'help'} onClose={() => setDialog(null)} onReset={resetAll} />
      <ReportDialog t={t} open={dialog === 'report'} onClose={() => setDialog(null)} chem={{ attempt, log, sample }} phys={{ no: physNo, attempt: physAttempt, log: physLog, sample: physSample }} />
      <footer>
        <p>Розробка та адаптація: Володимир Нікорич</p>
        <p>Чернівецький національний університет імені Юрія Федьковича, 2026.</p>
      </footer>
    </>
  );
}