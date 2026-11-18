import type { Fertilizer, IonId } from '../types';
import { interferences } from '../data/analyticalMatrix';

/**
 * Детермінована хімічна модель результату проби: залежить лише від складу зразка
 * та специфічності реакції (включно з перешкодами). Жодної випадковості.
 */
export function evaluateTest(ion: IonId, sample: Fertilizer): { positive: boolean } {
  const has = (i: IonId) => sample.ions.includes(i);
  const interfering = (interferences[ion] ?? []).some(has);
  return { positive: has(ion) || interfering };
}
