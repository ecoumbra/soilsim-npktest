import type { Fertilizer, IonId, LogEntry } from '../types';
import { fertilizers } from '../data/fertilizers';

export const MIN_TESTS = 3;
export type Cls = 'positive' | 'negative' | 'uncertain';
export type Status = 'insufficient' | 'contradiction' | 'unique' | 'indistinguishable';
export interface Identification { status: Status; candidates: Fertilizer[]; used: number }

/** K⁺-проба позитивна надійно лише коли NH₄⁺ перевірено і виявлено відсутнім. */
export function classify(log: LogEntry[]): Map<IonId, Cls> {
  const nh4 = log.find((e) => e.ion === 'NH4');
  const out = new Map<IonId, Cls>();
  for (const e of log) {
    if (!e.positive) out.set(e.ion, 'negative');
    else if (e.ion === 'K' && !(nh4 && !nh4.positive)) out.set(e.ion, 'uncertain');
    else out.set(e.ion, 'positive');
  }
  return out;
}

const sameIons = (a: Fertilizer, b: Fertilizer) => a.ions.length === b.ions.length && a.ions.every((i) => b.ions.includes(i));

export function identify(log: LogEntry[]): Identification {
  const used = [...classify(log)].filter(([, c]) => c !== 'uncertain');
  const candidates = fertilizers.filter((f) => used.every(([ion, c]) => f.ions.includes(ion) === (c === 'positive')));
  let status: Status = 'insufficient';
  if (candidates.length === 0) status = 'contradiction';
  else if (used.length < MIN_TESTS) status = 'insufficient';
  else if (candidates.length === 1) status = 'unique';
  else if (candidates.every((c) => sameIons(c, candidates[0]))) status = 'indistinguishable';
  return { status, candidates, used: used.length };
}

export function checkAnswer(answerId: string, actual: Fertilizer, r: Identification): 'correct' | 'acceptable' | 'wrong' {
  if (answerId === actual.id) return 'correct';
  if (r.status === 'indistinguishable' && r.candidates.some((c) => c.id === answerId)) return 'acceptable';
  return 'wrong';
}
