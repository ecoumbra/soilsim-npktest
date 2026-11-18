import { describe, expect, it } from 'vitest';
import { fertilizers } from '../src/data/fertilizers';
import { IONS } from '../src/data/analyticalMatrix';
import { checkAnswer, classify, identify } from '../src/engine/identification';
import { applyHeat, applyReagent, emptyTube, fillTube } from '../src/engine/experimentValidation';
import { evaluateTest } from '../src/engine/qualitativeAnalysis';
import type { Fertilizer, IonId, LogEntry } from '../src/types';

const byId = (id: string) => fertilizers.find((f) => f.id === id) as Fertilizer;
const log = (f: Fertilizer, ions: IonId[]): LogEntry[] => ions.map((ion) => ({ ion, positive: evaluateTest(ion, f).positive, observation: '' }));

describe('ідентифікація', () => {
  it('повний набір тестів однозначно визначає всі добрива (крім MAP/DAP)', () => {
    for (const f of fertilizers) {
      const r = identify(log(f, IONS));
      if (f.id === 'map' || f.id === 'dap') expect(r.status).toBe('indistinguishable');
      else {
        expect(r.status, f.id).toBe('unique');
        expect(r.candidates[0].id).toBe(f.id);
      }
    }
  });
  it('мало тестів — недостатньо', () => {
    expect(identify(log(byId('an'), ['NH4', 'NO3'])).status).toBe('insufficient');
    expect(identify([]).status).toBe('insufficient');
  });
  it('суперечливі результати', () => {
    const bad: LogEntry[] = (['NH4', 'NO3', 'SO4'] as IonId[]).map((ion) => ({ ion, positive: true, observation: '' }));
    expect(identify(bad).status).toBe('contradiction');
  });
  it('K⁺ позитивний без перевірки NH₄⁺ — невизначений', () => {
    const l = log(byId('kn'), ['K']);
    expect(classify(l).get('K')).toBe('uncertain');
    const l2 = log(byId('kn'), ['NH4', 'K']);
    expect(classify(l2).get('K')).toBe('positive');
    expect(classify(log(byId('ac'), ['NH4', 'K'])).get('K')).toBe('uncertain');
  });
  it('перевірка відповіді', () => {
    const r = identify(log(byId('map'), IONS));
    expect(checkAnswer('map', byId('map'), r)).toBe('correct');
    expect(checkAnswer('dap', byId('map'), r)).toBe('acceptable');
    expect(checkAnswer('an', byId('map'), r)).toBe('wrong');
  });
});

describe('валідація лабораторних операцій', () => {
  const start = () => fillTube(emptyTube()).tube;
  it('порожня пробірка не реагує', () => {
    expect(applyReagent(emptyTube(), 'BaCl2', byId('as')).entry).toBeUndefined();
  });
  it('NH₄⁺: NaOH без нагрівання результату не дає, після нагрівання — газ і синій лакмус', () => {
    const a = applyReagent(start(), 'NaOH', byId('ac'));
    expect(a.entry).toBeUndefined();
    const b = applyHeat(a.tube, byId('ac'));
    expect(b.entry?.positive).toBe(true);
    expect(b.tube.gas && b.tube.paper === 'blue').toBe(true);
  });
  it('сечовина з NaOH і нагріванням — негативно', () => {
    const b = applyHeat(applyReagent(start(), 'NaOH', byId('ur')).tube, byId('ur'));
    expect(b.entry?.positive).toBe(false);
  });
  it('нітрат: H₂SO₄ без FeSO₄ відхиляється; правильна послідовність дає кільце', () => {
    expect(applyReagent(start(), 'H2SO4', byId('kn')).entry).toBeUndefined();
    const a = applyReagent(start(), 'FeSO4', byId('kn'));
    const b = applyReagent(a.tube, 'H2SO4', byId('kn'));
    expect(b.entry?.positive).toBe(true);
    expect(b.tube.ring).toBe(true);
  });
  it('фосфат вимагає нагрівання', () => {
    const a = applyReagent(start(), 'Mo', byId('ds'));
    expect(a.entry).toBeUndefined();
    expect(applyHeat(a.tube, byId('ds')).entry?.positive).toBe(true);
  });
  it('неможливо змішувати дві реакції в одній пробірці', () => {
    const a = applyReagent(start(), 'BaCl2', byId('as'));
    const b = applyReagent(a.tube, 'AgNO3', byId('as'));
    expect(b.entry).toBeUndefined();
    expect(b.tube.reagents).toEqual(['BaCl2']);
  });
  it('підтвердження: BaSO₄ не розчиняється в HCl; AgCl розчиняється в NH₃', () => {
    const s = applyReagent(start(), 'BaCl2', byId('as'));
    expect(s.tube.confirm).toBe('SO4');
    expect(applyReagent(s.tube, 'HCl', byId('as')).tube.dissolved).toBe(false);
    const c = applyReagent(start(), 'AgNO3', byId('kc'));
    expect(applyReagent(c.tube, 'NH3', byId('kc')).tube.dissolved).toBe(true);
  });
});
