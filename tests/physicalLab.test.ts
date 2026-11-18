import { describe, expect, it } from 'vitest';
import { LAB_POOL } from '../src/data/physicalProperties';
import { ALL_TESTS, candidatesAfter, runPhysTest, testKey, type PhysEntry, type PhysTest } from '../src/engine/physicalQuiz';
import { checkPhysAnswer, checkTestForTarget, gateGuided, groupsFor, identifyPhys, propertyOf, suggestNext } from '../src/engine/physicalLab';

const sol = (grams: number): PhysTest => ({ kind: 'solubility', grams });
const rh = (v: number): PhysTest => ({ kind: 'humidity', rh: v });
const ph: PhysTest = { kind: 'ph' };
const look: PhysTest = { kind: 'look' };
const run = (id: string, t: PhysTest[]): PhysEntry[] => t.map((x) => runPhysTest(x, id));

describe('pH-тест', () => {
  it('амонійні солі слабокислі, решта нейтральні', () => {
    for (const id of ['an', 'as', 'ac']) expect(runPhysTest(ph, id).positive).toBe(true);
    for (const id of ['kn', 'kc', 'ks', 'ur']) expect(runPhysTest(ph, id).positive).toBe(false);
  });
  it('повний набір тестів, включно з pH, однозначно визначає кожен зразок', () => {
    for (const id of LAB_POOL) expect(candidatesAfter(run(id, ALL_TESTS))).toEqual([id]);
  });
});

describe('самостійний режим: придатність приладу', () => {
  it('без цілі дозволено все', () => { expect(checkTestForTarget(null, ph).ok).toBe(true); });
  it('pH-папірець не перевіряє гігроскопічність — пояснення', () => {
    const c = checkTestForTarget('humidity', ph);
    expect(c.ok).toBe(false);
    if (!c.ok) { expect(c.reason).toContain('кислотність'); expect(c.reason).toContain('гігроскопічність'); }
  });
  it('відповідний тест дозволено', () => { expect(checkTestForTarget('solubility', sol(50)).ok).toBe(true); expect(propertyOf(rh(80))).toBe('humidity'); });
});

describe('покроковий режим', () => {
  it('першим кроком є візуальний огляд', () => { expect(suggestNext([]).test).toEqual(look); });
  it('далі пропонується тест, що ділить коло добрив, і ніколи не зайвий', () => {
    for (const id of LAB_POOL) {
      let log: PhysEntry[] = run(id, [look]);
      for (let i = 0; i < 6; i++) {
        const s = suggestNext(log);
        if (!s.test) break;
        expect(gateGuided(log, s.test).ok).toBe(true);
        const before = candidatesAfter(log).length;
        log = [...log, runPhysTest(s.test, id)];
        expect(candidatesAfter(log).length).toBeLessThan(before);
      }
      expect(candidatesAfter(log)).toEqual([id]);
      expect(identifyPhys(log).status).toBe('unique');
    }
  });
  it('жадібна стратегія вкладається у 3 інформативні тести', () => {
    for (const id of LAB_POOL) {
      let log: PhysEntry[] = run(id, [look]); let n = 0;
      for (;;) { const s = suggestNext(log); if (!s.test) break; log = [...log, runPhysTest(s.test, id)]; n++; }
      expect(n).toBeLessThan(4);
    }
  });
  it('зайвий тест блокується з поясненням', () => {
    const log = run('an', [sol(150)]);
    const g = gateGuided(log, sol(100));
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.reason).toContain('однаковий результат');
    expect(groupsFor([], ph)[0].length + groupsFor([], ph)[1].length).toBe(LAB_POOL.length);
  });
});

describe('ідентифікація', () => {
  it('відповідь зараховується лише при однозначному результаті', () => {
    const weak = run('kn', [rh(95)]);
    expect(checkPhysAnswer('kn', 'kn', weak)).toBe('not_ready');
    const ok = run('kn', [rh(95), rh(85)]);
    expect(checkPhysAnswer('kn', 'kn', ok)).toBe('correct');
    expect(checkPhysAnswer('kc', 'kn', ok)).toBe('wrong');
    expect(new Set(ALL_TESTS.map(testKey)).size).toBe(ALL_TESTS.length);
  });
});
