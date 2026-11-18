import type { Fertilizer } from '../types';
import { fertilizers } from '../data/fertilizers';
import { CLUES, LAB_POOL, physical, type Clue } from '../data/physicalProperties';
import { shuffle, type Graded, type Rng } from './quiz';

/** Тест «Фізичні властивості добрив»: максимум 10 балів. */
export const PHYS_POINTS = { property: 2, storage: 2, solubility: 2, sequence: 2, conclusion: 2 } as const;
export const PHYS_MAX = Object.values(PHYS_POINTS).reduce((a, b) => a + b, 0);

const fert = (id: string) => fertilizers.find((f) => f.id === id) as Fertilizer;
const nm = (id: string) => fert(id).name;
const pick = <T>(a: T[], rng: Rng): T => a[Math.floor(rng() * a.length)];
export const fmt = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
const sol = (id: string) => physical[id].solubility20 as number;
const crh = (id: string) => physical[id].crh30 as number;

/* ---------- Завдання 1: властивість → добриво (2 бали) ---------- */
export interface PropertyQuestion { clueId: string; text: string; answer: string; options: string[] }
export function makePropertyQuestion(rng: Rng, clueId?: string): PropertyQuestion {
  const c = CLUES.find((x) => x.id === clueId) ?? pick(CLUES, rng);
  const d = shuffle(c.pool.filter((x) => x !== c.answer), rng).slice(0, 3);
  return { clueId: c.id, text: c.text, answer: c.answer, options: shuffle([c.answer, ...d], rng) };
}
export function gradeProperty(q: PropertyQuestion, chosen: string): Graded {
  const c = CLUES.find((x) => x.id === q.clueId) as Clue;
  const ok = chosen === q.answer;
  return { points: ok ? PHYS_POINTS.property : 0, max: PHYS_POINTS.property, ok, explanation: ok ? `Правильно. ${c.why}` : `Неправильно: «${nm(chosen)}» не відповідає цим ознакам. ${c.why}` };
}

/* ---------- Завдання 2: гігроскопічність і зберігання (2 бали) ---------- */
export type StorageMode = 'most' | 'least';
export interface StorageQuestion { mode: StorageMode; options: string[]; answer: string }
export function makeStorageQuestion(rng: Rng, mode?: StorageMode): StorageQuestion {
  const m: StorageMode = mode ?? (rng() < 0.5 ? 'most' : 'least');
  for (let i = 0; i < 300; i++) {
    const ids = shuffle([...LAB_POOL] as string[], rng).slice(0, 4);
    const s = [...ids].sort((a, b) => crh(a) - crh(b));
    const gap = m === 'most' ? crh(s[1]) - crh(s[0]) : crh(s[3]) - crh(s[2]);
    if (gap >= 3) return { mode: m, options: ids, answer: m === 'most' ? s[0] : s[3] };
  }
  const ids = ['an', 'ur', 'kn', 'ks'];
  return { mode: m, options: ids, answer: m === 'most' ? 'an' : 'ks' };
}
export function gradeStorage(q: StorageQuestion, chosen: string): Graded {
  const list = [...q.options].sort((a, b) => crh(a) - crh(b)).map((id) => `${nm(id)} — ${fmt(crh(id))} %`).join('; ');
  const ok = chosen === q.answer;
  const rule = 'Критична відносна вологість (CRH, 30 °C) — вологість повітря, вище якої сіль поглинає воду з атмосфери: чим нижча CRH, тим легше добриво відсирює й злежується.';
  return { points: ok ? PHYS_POINTS.storage : 0, max: PHYS_POINTS.storage, ok, explanation: `${ok ? 'Правильно.' : 'Неправильно.'} ${rule} Значення: ${list}.` };
}

/* ---------- Завдання 3: розрахунок розчинності (2 бали) ---------- */
export interface SolubilityQuestion { id: string; volume: number; options: number[]; answer: number }
const SOL_IDS = [...LAB_POOL, 'map'] as string[];
export function makeSolubilityQuestion(rng: Rng, id?: string, volume?: number): SolubilityQuestion {
  const f = id ?? pick(SOL_IDS, rng);
  const v = volume ?? pick([50, 200, 250, 500], rng);
  const s = sol(f);
  const r1 = (x: number) => Math.round(x * 10) / 10;
  const answer = r1((s * v) / 100);
  const wrong = [s, (s * v) / 10, (s * 100) / v, (s * v) / 1000, s * v].map(r1);
  const uniq: number[] = [];
  for (const w of shuffle(wrong, rng)) if (w !== answer && !uniq.includes(w)) uniq.push(w);
  return { id: f, volume: v, answer, options: shuffle([answer, ...uniq.slice(0, 3)], rng) };
}
export function gradeSolubility(q: SolubilityQuestion, chosen: number): Graded {
  const ok = chosen === q.answer;
  return {
    points: ok ? PHYS_POINTS.solubility : 0, max: PHYS_POINTS.solubility, ok,
    explanation: `${ok ? 'Правильно.' : 'Неправильно.'} Розчинність ${nm(q.id)} при 20 °C ≈ ${fmt(sol(q.id))} г на 100 мл води, тому в ${q.volume} мл: m = ${fmt(sol(q.id))} · ${q.volume} / 100 = ${fmt(q.answer)} г (густина води ≈ 1 г/мл).`,
  };
}

/* ---------- Завдання 4: віртуальна фізична лабораторія ---------- */
export type PhysTest = { kind: 'look' } | { kind: 'solubility'; grams: number } | { kind: 'humidity'; rh: number } | { kind: 'ph' };
export const SOL_MASSES = [20, 50, 100, 150] as const;
export const RH_LEVELS = [60, 75, 80, 85, 95] as const;
export const ALL_TESTS: PhysTest[] = [
  { kind: 'look' },
  ...SOL_MASSES.map((grams) => ({ kind: 'solubility' as const, grams })),
  ...RH_LEVELS.map((rh) => ({ kind: 'humidity' as const, rh })),
  { kind: 'ph' },
];
export const testKey = (t: PhysTest) => (t.kind === 'look' ? 'look' : t.kind === 'ph' ? 'ph' : t.kind === 'solubility' ? `sol${t.grams}` : `rh${t.rh}`);
export const testLabel = (t: PhysTest) =>
  t.kind === 'look' ? 'Візуальний огляд' : t.kind === 'ph' ? 'pH 1 % розчину (індикаторний папірець)' : t.kind === 'solubility' ? `Розчинність: ${t.grams} г у 100 мл води, 20 °C` : `Гігроскопічність: вологість повітря ${t.rh} %, 30 °C`;

export interface PhysEntry { test: PhysTest; positive: boolean | null; text: string }
/** true — повністю розчинилось / поглинає вологу; null — тест лише описовий (колір ненадійний для ідентифікації). */
export function outcome(t: PhysTest, id: string): boolean | null {
  if (t.kind === 'ph') return physical[id].acidic;
  if (t.kind === 'solubility') return sol(id) >= t.grams;
  if (t.kind === 'humidity') return t.rh >= crh(id);
  return null;
}
export function runPhysTest(t: PhysTest, id: string): PhysEntry {
  const positive = outcome(t, id);
  const text = t.kind === 'ph' ? (positive ? 'Індикаторний папірець набув помаранчево-жовтого кольору: розчин слабокислий.' : 'Індикаторний папірець позеленів: розчин нейтральний.')
    : t.kind === 'look' ? `Зовнішній вигляд: ${physical[id].look}.`
    : t.kind === 'solubility' ? (positive ? `Усі ${t.grams} г розчинились у 100 мл води — розчин прозорий.` : 'Розчинилась лише частина: на дні лишились нерозчинені кристали (розчин насичений).')
      : positive ? 'Зразок поглинає вологу з повітря: поверхня мокріє, кристали злипаються й розпливаються.' : 'Зразок залишається сухим і сипким.';
  return { test: t, positive, text };
}
export const candidatesAfter = (log: PhysEntry[]): string[] =>
  (LAB_POOL as readonly string[]).filter((id) => log.every((e) => e.positive === null || outcome(e.test, id) === e.positive));

/** Найменший набір інформативних тестів, що однозначно визначає зразок. */
export function minimalTests(id: string): PhysTest[] {
  const inf = ALL_TESTS.filter((t) => t.kind !== 'look');
  for (let k = 1; k <= inf.length; k++) {
    for (let mask = 1; mask < 1 << inf.length; mask++) {
      const set = inf.filter((_, i) => mask & (1 << i));
      if (set.length !== k) continue;
      const c = candidatesAfter(set.map((t) => runPhysTest(t, id)));
      if (c.length === 1 && c[0] === id) return set;
    }
  }
  return inf;
}

export interface PhysSequenceGrade { points: number; max: number; checks: { ok: boolean; text: string }[]; notes: string[] }
/** 1 б — зразок однозначно визначено; 1 б — жодного зайвого тесту (кожен інформативний тест звузив коло добрив). */
export function gradePhysSequence(log: PhysEntry[], sample: string): PhysSequenceGrade {
  const left = candidatesAfter(log);
  const identified = left.length === 1 && left[0] === sample;
  const notes: string[] = [];
  let prev = LAB_POOL.length;
  let redundant = 0;
  log.forEach((e, i) => {
    if (e.positive === null) return;
    const n = candidatesAfter(log.slice(0, i + 1)).length;
    if (n >= prev) { redundant++; notes.push(`Тест «${testLabel(e.test)}» не звузив коло добрив — зайвий крок.`); }
    prev = n;
  });
  if (!identified) notes.push(`Результатів недостатньо: після ваших тестів залишилось можливих добрив — ${left.length}.`);
  const min = minimalTests(sample);
  notes.push(`Мінімально достатньо ${min.length} тест(ів), наприклад: ${min.map(testLabel).join('; ')}.`);
  const checks = [
    { ok: identified, text: 'Зразок однозначно визначено' },
    { ok: identified && redundant === 0, text: 'Немає зайвих тестів' },
  ];
  return { points: checks.filter((c) => c.ok).length, max: PHYS_POINTS.sequence, checks, notes };
}

export interface PhysJustification { id: string; text: string }
const phrase = (t: PhysTest, v: boolean) => (t.kind === 'ph' ? `pH-папірець — ${v ? 'розчин слабокислий' : 'розчин нейтральний'}` : t.kind === 'solubility' ? `${t.grams} г/100 мл — ${v ? 'розчинилось повністю' : 'розчинилось не повністю'}` : t.kind === 'humidity' ? `RH ${(t as { rh: number }).rh} % — ${v ? 'вологу поглинає' : 'залишається сухим'}` : '');
/** Варіанти обґрунтування: правильний точно відповідає результатам студента. */
export function makePhysJustifications(log: PhysEntry[], rng: Rng): PhysJustification[] {
  const inf = log.filter((e) => e.positive !== null);
  const base = inf.map((e) => e.positive as boolean);
  const mk = (vals: boolean[]): PhysJustification => ({ id: vals.map((v) => (v ? '1' : '0')).join(''), text: inf.map((e, i) => phrase(e.test, vals[i])).join('; ') });
  const variants = [mk(base)];
  for (const i of shuffle(base.map((_, k) => k), rng)) { if (variants.length >= 4) break; variants.push(mk(base.map((v, k) => (k === i ? !v : v)))); }
  return shuffle(variants, rng);
}
export const correctPhysJustId = (log: PhysEntry[]): string => log.filter((e) => e.positive !== null).map((e) => (e.positive ? '1' : '0')).join('');

/** 1 б — правильне добриво (лише якщо зразок встановлено однозначно); 1 б — обґрунтування відповідає результатам. */
export function gradePhysConclusion(answerId: string, justId: string, sample: string, log: PhysEntry[]): Graded {
  const max = PHYS_POINTS.conclusion;
  if (candidatesAfter(log).length !== 1) return { points: 0, max, ok: false, explanation: 'Висновок не можна обґрунтувати: за вашими тестами зразок визначити однозначно не вдалося.' };
  const a = answerId === sample ? 1 : 0;
  const j = justId === correctPhysJustId(log) ? 1 : 0;
  const parts = [a ? `Добриво визначено правильно: ${nm(sample)}.` : `Добриво визначено неправильно: зразок — ${nm(sample)}.`,
    j ? 'Обґрунтування відповідає результатам ваших тестів.' : 'Обґрунтування не відповідає вашим результатам: у висновку треба посилатися на фактично спостережені ефекти.'];
  return { points: a + j, max, ok: a + j === max, explanation: parts.join(' ') };
}

export const makePhysTask = (rng: Rng, id?: string): { sample: string } => ({ sample: id ?? pick([...LAB_POOL] as string[], rng) });
export const physTotal = (s: { property: number; storage: number; solubility: number; sequence: number; conclusion: number }): number =>
  s.property + s.storage + s.solubility + s.sequence + s.conclusion;
