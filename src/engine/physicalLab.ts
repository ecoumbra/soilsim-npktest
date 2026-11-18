import { fertilizers } from '../data/fertilizers';
import { LAB_POOL } from '../data/physicalProperties';
import { ALL_TESTS, candidatesAfter, outcome, testKey, testLabel, type PhysEntry, type PhysTest } from './physicalQuiz';

/** Логіка лабораторії фізичних властивостей (за аналогією з engine/protocol.ts для якісних реакцій). */
export type PhysProperty = 'look' | 'solubility' | 'humidity' | 'ph';
export type PhysMode = 'guided' | 'free';
export const PROPERTY_LABEL: Record<PhysProperty, string> = { look: 'зовнішній вигляд', solubility: 'розчинність', humidity: 'гігроскопічність', ph: 'кислотність розчину' };
const HOW: Record<PhysProperty, string> = {
  look: 'розгляньте зразок через лупу (форма, колір, блиск)',
  solubility: 'зважте наважку, внесіть у 10 мл води при 20 °C й помішайте: перевірте, чи розчинилась вона повністю',
  humidity: 'витримайте зразок у камері із заданою відносною вологістю при 30 °C й спостерігайте, чи він зволожується',
  ph: 'занурте універсальний індикаторний папірець у 1 % розчин і порівняйте колір зі шкалою',
};
export const propertyOf = (t: PhysTest): PhysProperty => (t.kind === 'look' ? 'look' : t.kind === 'solubility' ? 'solubility' : t.kind === 'humidity' ? 'humidity' : 'ph');
const names = (ids: string[]) => ids.map((id) => fertilizers.find((f) => f.id === id)?.name ?? id).join(', ');

export type Check = { ok: true } | { ok: false; reason: string };

/** Самостійний режим: чи придатний прилад/тест для властивості, яку студент хоче перевірити. */
export function checkTestForTarget(target: PhysProperty | null, t: PhysTest): Check {
  if (!target || propertyOf(t) === target) return { ok: true };
  const p = propertyOf(t);
  return { ok: false, reason: `Тест «${testLabel(t)}» визначає ${PROPERTY_LABEL[p]} і не дає змоги перевірити ${PROPERTY_LABEL[target]}. Щоб визначити ${PROPERTY_LABEL[target]}, ${HOW[target]}.` };
}

/** Розподіл можливих добрив за результатом тесту: [позитивний, негативний]. */
export function groupsFor(log: PhysEntry[], t: PhysTest): [string[], string[]] {
  const c = candidatesAfter(log);
  return [c.filter((id) => outcome(t, id) === true), c.filter((id) => outcome(t, id) === false)];
}

/** Покроковий режим: тест, що нічого не звузить, блокується з поясненням. */
export function gateGuided(log: PhysEntry[], t: PhysTest): Check {
  if (t.kind === 'look') return { ok: true };
  const [yes, no] = groupsFor(log, t);
  if (yes.length === 0 || no.length === 0) {
    return { ok: false, reason: `Усі добрива, що ще залишились (${names(candidatesAfter(log))}), дадуть однаковий результат цього тесту — він нічого не звузить. Оберіть інший тест.` };
  }
  return { ok: true };
}

export interface Suggestion { test: PhysTest | null; reason: string }
/** Наступний крок для покрокового режиму: найкраще ділить коло можливих добрив навпіл. */
export function suggestNext(log: PhysEntry[]): Suggestion {
  const cands = candidatesAfter(log);
  if (!log.some((e) => e.test.kind === 'look')) {
    return { test: { kind: 'look' }, reason: 'Спочатку огляньте зразок: форма, колір і блиск дають першу інформацію, але колір сам по собі — ненадійна ознака.' };
  }
  if (cands.length <= 1) return { test: null, reason: cands.length === 1 ? `Зразок встановлено: ${names(cands)}. Перейдіть до ідентифікації й підтвердіть висновок.` : 'Результати суперечливі.' };
  const done = new Set(log.map((e) => testKey(e.test)));
  let best: { t: PhysTest; worst: number; a: number; b: number } | null = null;
  for (const t of ALL_TESTS) {
    if (t.kind === 'look' || done.has(testKey(t))) continue;
    const [y, n] = groupsFor(log, t);
    if (!y.length || !n.length) continue;
    const worst = Math.max(y.length, n.length);
    if (!best || worst < best.worst) best = { t, worst, a: y.length, b: n.length };
  }
  if (!best) return { test: null, reason: 'Подальші тести нічого не звузять.' };
  return { test: best.t, reason: `Серед ${cands.length} можливих добрив (${names(cands)}) цей тест поділить їх на групи по ${best.a} і ${best.b}: після нього залишиться не більше ${best.worst}.` };
}

export type PhysStatus = 'insufficient' | 'unique';
export const identifyPhys = (log: PhysEntry[]): { status: PhysStatus; candidates: string[] } => {
  const candidates = candidatesAfter(log);
  return { status: candidates.length === 1 ? 'unique' : 'insufficient', candidates };
};
export const checkPhysAnswer = (answerId: string, sample: string, log: PhysEntry[]): 'correct' | 'wrong' | 'not_ready' =>
  identifyPhys(log).status !== 'unique' ? 'not_ready' : answerId === sample ? 'correct' : 'wrong';
export const LAB_IDS = [...LAB_POOL] as string[];

/** Лабораторний масштаб 1:10: наважка у 10 мл води еквівалентна g/100 мл у таблицях розчинності. */
export const labGrams = (t: PhysTest): number => (t.kind === 'solubility' ? t.grams / 10 : 0);
export function labLabel(t: PhysTest): string {
  if (t.kind === 'look') return 'Візуальний огляд (лупа)';
  if (t.kind === 'ph') return 'pH 1 % розчину (індикаторний папірець)';
  if (t.kind === 'solubility') return `Розчинність: наважка ${labGrams(t)} г у 10 мл води, 20 °C`;
  return `Гігроскопічність: відносна вологість ${t.rh} %, 30 °C`;
}
export function labText(e: PhysEntry): string {
  const t = e.test;
  if (t.kind === 'solubility') return e.positive ? `Усі ${labGrams(t)} г розчинились у 10 мл води — розчин прозорий.` : 'Розчинилась лише частина: на дні лишились нерозчинені кристали (розчин насичений).';
  return e.text;
}
export function resultWord(e: PhysEntry): string {
  if (e.positive === null) return '—';
  const t = e.test;
  if (t.kind === 'solubility') return e.positive ? 'розчинилась повністю' : 'розчинилась частково';
  if (t.kind === 'humidity') return e.positive ? 'поглинає вологу' : 'залишається сухим';
  return e.positive ? 'слабокислий' : 'нейтральний';
}
