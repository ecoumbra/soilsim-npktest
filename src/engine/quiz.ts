import type { Fertilizer, IonId, LogEntry } from '../types';
import { IONS } from '../data/analyticalMatrix';
import { fertilizers } from '../data/fertilizers';
import { reactions } from '../data/reactions';
import { evaluateTest } from './qualitativeAnalysis';
import { MIN_TESTS, checkAnswer, classify, identify, type Identification } from './identification';
import { checkReagentForIon } from './protocol';

/** Система оцінювання: максимум 10 балів. */
export const POINTS = { reagent: 1, interpretation: 2, identification: 3, sequence: 3, conclusion: 1 } as const;
export const MAX_POINTS = Object.values(POINTS).reduce((a, b) => a + b, 0);

export type Rng = () => number;
export const mulberry32 = (seed: number): Rng => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pickOne = <T>(a: T[], rng: Rng): T => a[Math.floor(rng() * a.length)];
export function shuffle<T>(a: T[], rng: Rng): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
const sameIons = (a: Fertilizer, b: Fertilizer) => a.ions.length === b.ions.length && a.ions.every((i) => b.ions.includes(i));
const ionList = (l: IonId[]) => l.map((i) => reactions[i].ion.split(' ')[0]).join(', ');

export interface Graded { points: number; max: number; ok: boolean; explanation: string }

/* ---------- Тип 1. Визначення реактиву (1 бал) ---------- */
export interface ReagentQuestion { ion: IonId; options: IonId[] } // option = реактив, що належить цьому йону
export function makeReagentQuestion(rng: Rng, ion?: IonId): ReagentQuestion {
  const i = ion ?? pickOne(IONS, rng);
  return { ion: i, options: shuffle([i, ...shuffle(IONS.filter((x) => x !== i), rng).slice(0, 3)], rng) };
}
export function gradeReagent(q: ReagentQuestion, chosen: IonId): Graded {
  if (chosen === q.ion) return { points: POINTS.reagent, max: POINTS.reagent, ok: true, explanation: `Правильно. ${reactions[q.ion].reagent}: ${reactions[q.ion].obsPositive}` };
  const c = checkReagentForIon(q.ion, reactions[chosen].reagents[0]);
  return { points: 0, max: POINTS.reagent, ok: false, explanation: c.ok ? '' : c.reason };
}

/* ---------- Тип 2. Інтерпретація реакції (2 бали) ---------- */
export interface InterpretationQuestion { ion: IonId; scenario: string; options: IonId[] }
export function makeInterpretationQuestion(rng: Rng, ion?: IonId): InterpretationQuestion {
  const i = ion ?? pickOne(IONS, rng);
  return { ion: i, scenario: reactions[i].scenario, options: shuffle([i, ...shuffle(IONS.filter((x) => x !== i), rng).slice(0, 3)], rng) };
}
export function gradeInterpretation(q: InterpretationQuestion, chosen: IonId): Graded {
  const r = reactions[q.ion];
  if (chosen === q.ion) return { points: POINTS.interpretation, max: POINTS.interpretation, ok: true, explanation: `Правильно. ${r.significance} ${r.interferences}` };
  return { points: 0, max: POINTS.interpretation, ok: false, explanation: `Така ознака характерна для ${r.ion} (реактив ${r.reagent}): ${r.obsPositive} ${reactions[chosen].ion} виявляють іншою реакцією — ${reactions[chosen].reagent}.` };
}

/* ---------- Тип 3. Встановлення добрива за результатами (3 бали) ---------- */
export interface IdentificationQuestion { sample: Fertilizer; results: { ion: IonId; positive: boolean }[]; options: string[] }
export function makeIdentificationQuestion(rng: Rng, fertilizerId?: string): IdentificationQuestion {
  const f = fertilizers.find((x) => x.id === fertilizerId) ?? pickOne(fertilizers, rng);
  const nh4 = f.ions.includes('NH4');
  // проба на K⁺ не показується для амонійних зразків: вона ненадійна
  const results = IONS.filter((i) => !(i === 'K' && nh4)).map((ion) => ({ ion, positive: evaluateTest(ion, f).positive }));
  const distractors = shuffle(fertilizers.filter((x) => !sameIons(x, f)), rng).slice(0, 3);
  return { sample: f, results, options: shuffle([f, ...distractors], rng).map((x) => x.id) };
}
export function gradeIdentification(q: IdentificationQuestion, chosenId: string): Graded {
  const chosen = fertilizers.find((x) => x.id === chosenId) as Fertilizer;
  const max = POINTS.identification;
  if (sameIons(chosen, q.sample)) {
    const extra = chosen.id === q.sample.id ? '' : ` Цими реакціями ${chosen.name} і ${q.sample.name} не розрізнити.`;
    return { points: max, max, ok: true, explanation: `Правильно: ${q.sample.name} (${q.sample.formula}).${extra}` };
  }
  const bad = q.results.find((r) => chosen.ions.includes(r.ion) !== r.positive);
  const why = bad ? `Для добрива «${chosen.name}» реакція на ${reactions[bad.ion].ion} мала б бути ${chosen.ions.includes(bad.ion) ? 'позитивною' : 'негативною'}, а за результатами — ${bad.positive ? 'позитивна' : 'негативна'}.` : '';
  return { points: 0, max, ok: false, explanation: `${why} Склад зразка: ${q.sample.ions.length ? ionList(q.sample.ions) : 'жодного з визначуваних йонів (сечовина)'} — це ${q.sample.name}.` };
}

/* ---------- Тип 4. Віртуальна задача: послідовність (3 бали) і висновок (1 бал) ---------- */
export function makeLabTask(rng: Rng, fertilizerId?: string): { sample: Fertilizer } {
  return { sample: fertilizers.find((x) => x.id === fertilizerId) ?? pickOne(fertilizers, rng) };
}
export function runTest(ion: IonId, sample: Fertilizer): LogEntry {
  const positive = evaluateTest(ion, sample).positive;
  return { ion, positive, observation: positive ? reactions[ion].obsPositive : reactions[ion].obsNegative };
}

export interface SequenceGrade { points: number; max: number; checks: { ok: boolean; text: string }[]; notes: string[] }
/**
 * 1 б — проведено не менше MIN_TESTS незалежних досліджень;
 * 1 б — результатів достатньо для однозначної ідентифікації (або групи з однаковим йонним складом);
 * 1 б — жодного зайвого кроку: кожне дослідження звужує коло добрив (проба на K⁺ — лише після перевірки NH₄⁺).
 */
export function gradeSequence(log: LogEntry[], sample: Fertilizer): SequenceGrade {
  const notes: string[] = [];
  const enough = log.length >= MIN_TESTS;
  const ident = identify(log);
  const sufficient = (ident.status === 'unique' || ident.status === 'indistinguishable') && ident.candidates.some((c) => c.id === sample.id);
  let prev = fertilizers.length;
  let redundant = 0;
  log.forEach((e, i) => {
    const n = identify(log.slice(0, i + 1)).candidates.length;
    if (n >= prev) {
      redundant++;
      notes.push(e.ion === 'K' && classify(log.slice(0, i + 1)).get('K') === 'uncertain'
        ? 'Проба на K⁺ без попередньої перевірки відсутності NH₄⁺ ненадійна: амоній дає такий самий жовтий осад.'
        : `Дослідження на ${reactions[e.ion].ion} не звузило коло можливих добрив — зайвий крок.`);
    }
    prev = n;
  });
  if (!enough) notes.push(`Проведено менше ${MIN_TESTS} досліджень: добриво не можна встановити за однією чи двома реакціями.`);
  else if (!sufficient) notes.push('Наявних результатів недостатньо для однозначної ідентифікації зразка.');
  const clean = enough && redundant === 0;
  const checks = [
    { ok: enough, text: `Проведено щонайменше ${MIN_TESTS} дослідження` },
    { ok: sufficient, text: 'Результатів достатньо для ідентифікації' },
    { ok: clean, text: 'Немає зайвих або ненадійних кроків' },
  ];
  return { points: checks.filter((c) => c.ok).length, max: POINTS.sequence, checks, notes };
}

export interface Justification { id: string; ions: IonId[]; text: string }
const jKey = (l: IonId[]) => [...l].sort().join(',') || 'none';
const jText = (pos: IonId[], tested: IonId[]) => {
  const neg = tested.filter((i) => !pos.includes(i));
  return `Виявлено: ${pos.length ? ionList(pos) : 'жодного йона'}; не виявлено: ${neg.length ? ionList(neg) : '—'}`;
};
/** Варіанти обґрунтування висновку; правильний — точно відповідає журналу студента. */
export function makeJustifications(log: LogEntry[], rng: Rng): Justification[] {
  const cls = classify(log);
  const tested = log.filter((e) => cls.get(e.ion) !== 'uncertain').map((e) => e.ion);
  const pos = tested.filter((i) => cls.get(i) === 'positive');
  const map = new Map<string, IonId[]>([[jKey(pos), pos]]);
  for (const ion of shuffle(tested, rng)) {
    if (map.size >= 4) break;
    const alt = pos.includes(ion) ? pos.filter((x) => x !== ion) : [...pos, ion];
    map.set(jKey(alt), alt);
  }
  return shuffle([...map.values()], rng).map((ions) => ({ id: jKey(ions), ions, text: jText(ions, tested) }));
}
export const correctJustificationId = (log: LogEntry[]): string => {
  const cls = classify(log);
  return jKey(log.filter((e) => cls.get(e.ion) === 'positive').map((e) => e.ion));
};

export function gradeConclusion(answerId: string, justId: string, sample: Fertilizer, log: LogEntry[]): Graded {
  const max = POINTS.conclusion;
  const ident: Identification = identify(log);
  if (ident.status !== 'unique' && ident.status !== 'indistinguishable') {
    return { points: 0, max, ok: false, explanation: 'Висновок не можна науково обґрунтувати: результатів недостатньо або вони суперечать одне одному.' };
  }
  const verdict = checkAnswer(answerId, sample, ident);
  const justOk = justId === correctJustificationId(log);
  const ok = verdict !== 'wrong' && justOk;
  const parts = [verdict === 'wrong' ? `Добриво визначено неправильно: зразок — ${sample.name} (${sample.formula}).` : `Добриво визначено правильно: ${sample.name}.`,
    justOk ? 'Обґрунтування відповідає результатам ваших досліджень.' : 'Обґрунтування не відповідає вашим результатам: у висновку слід посилатися на виявлені й невиявлені йони з журналу.'];
  return { points: ok ? max : 0, max, ok, explanation: parts.join(' ') };
}

export interface Scores { reagent: number; interpretation: number; identification: number; sequence: number; conclusion: number }
export const totalScore = (s: Scores): number => s.reagent + s.interpretation + s.identification + s.sequence + s.conclusion;
