import { describe, expect, it } from 'vitest';
import { CLUES, LAB_POOL, physical } from '../src/data/physicalProperties';
import { fertilizers } from '../src/data/fertilizers';
import { references } from '../src/data/references';
import { mulberry32 } from '../src/engine/quiz';
import {
  ALL_TESTS, PHYS_MAX, PHYS_POINTS, RH_LEVELS, SOL_MASSES, candidatesAfter, correctPhysJustId, gradePhysConclusion, gradePhysSequence, gradeProperty,
  gradeSolubility, gradeStorage, makePhysJustifications, makePropertyQuestion, makeSolubilityQuestion, makeStorageQuestion, minimalTests, runPhysTest, testKey,
  type PhysTest,
} from '../src/engine/physicalQuiz';

const sol = (grams: number): PhysTest => ({ kind: 'solubility', grams });
const rh = (v: number): PhysTest => ({ kind: 'humidity', rh: v });
const run = (id: string, tests: PhysTest[]) => tests.map((t) => runPhysTest(t, id));

describe('дані', () => {
  it('усі добрива бази мають фізичні властивості, а посилання існують у references', () => {
    const ids = references.map((r) => r.id);
    for (const f of fertilizers) {
      expect(physical[f.id]).toBeDefined();
      for (const r of physical[f.id].refs) expect(ids).toContain(r);
    }
  });
  it('пул лабораторії має обидва числові параметри', () => {
    for (const id of LAB_POOL) { expect(physical[id].solubility20).toBeGreaterThan(0); expect(physical[id].crh30).toBeGreaterThan(0); }
  });
  it('рівні вологості не збігаються з жодним CRH', () => {
    for (const id of LAB_POOL) expect((RH_LEVELS as readonly number[]).includes(physical[id].crh30 as number)).toBe(false);
  });
  it('максимум 10 балів', () => { expect(PHYS_MAX).toBe(10); expect(PHYS_POINTS.sequence + PHYS_POINTS.conclusion).toBe(4); });
});

describe('завдання 1: властивості', () => {
  it('кожна ознака має правильну відповідь у варіантах, без дублів', () => {
    for (const c of CLUES) {
      const q = makePropertyQuestion(mulberry32(3), c.id);
      expect(q.options).toContain(c.answer);
      expect(new Set(q.options).size).toBe(4);
      expect(gradeProperty(q, c.answer).points).toBe(PHYS_POINTS.property);
      const wrong = q.options.find((o) => o !== c.answer) as string;
      expect(gradeProperty(q, wrong).points).toBe(0);
    }
  });
  it('числова розчинність у ознаках відрізняє правильну відповідь від варіантів щонайменше на 15 г/100 мл', () => {
    for (const c of CLUES.filter((x) => /г на 100 мл/.test(x.text))) {
      const a = physical[c.answer].solubility20 as number;
      for (const d of c.pool) {
        const s = physical[d].solubility20;
        if (s !== null) expect(Math.abs(s - a)).toBeGreaterThan(14);
      }
    }
  });
});

describe('завдання 2: гігроскопічність', () => {
  it('правильна відповідь має найнижчу (найвищу) CRH з відривом ≥ 3', () => {
    for (let seed = 1; seed <= 25; seed++) {
      for (const mode of ['most', 'least'] as const) {
        const q = makeStorageQuestion(mulberry32(seed), mode);
        const v = [...q.options].map((id) => physical[id].crh30 as number).sort((a, b) => a - b);
        const a = physical[q.answer].crh30 as number;
        if (mode === 'most') { expect(a).toBe(v[0]); expect(v[1] - v[0]).toBeGreaterThan(2.9); }
        else { expect(a).toBe(v[3]); expect(v[3] - v[2]).toBeGreaterThan(2.9); }
        expect(gradeStorage(q, q.answer).points).toBe(PHYS_POINTS.storage);
      }
    }
  });
});

describe('завдання 3: розрахунок розчинності', () => {
  it('правильна відповідь m = s·V/100, варіанти унікальні', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const q = makeSolubilityQuestion(mulberry32(seed));
      const s = physical[q.id].solubility20 as number;
      expect(q.answer).toBe(Math.round(((s * q.volume) / 100) * 10) / 10);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
      expect(gradeSolubility(q, q.answer).points).toBe(PHYS_POINTS.solubility);
      const w = q.options.find((o) => o !== q.answer) as number;
      expect(gradeSolubility(q, w).points).toBe(0);
    }
  });
});

describe('віртуальна фізична лабораторія', () => {
  it('усі зразки пулу розрізняються повним набором тестів', () => {
    const vec = (id: string) => ALL_TESTS.map((t) => String(runPhysTest(t, id).positive)).join();
    expect(new Set(LAB_POOL.map(vec)).size).toBe(LAB_POOL.length);
    for (const id of LAB_POOL) expect(candidatesAfter(run(id, ALL_TESTS))).toEqual([id]);
  });
  it('колір — описовий тест і не звужує коло добрив', () => {
    const e = runPhysTest({ kind: 'look' }, 'kc');
    expect(e.positive).toBe(null);
    expect(candidatesAfter([e]).length).toBe(LAB_POOL.length);
  });
  it('мінімальні набори: AN — 1 тест, KS — 1 тест, інші — не більше 3', () => {
    expect(minimalTests('an').length).toBe(1);
    expect(minimalTests('ks').length).toBe(1);
    for (const id of LAB_POOL) expect(minimalTests(id).length).toBeLessThan(4);
  });
  it('оцінювання послідовності', () => {
    expect(gradePhysSequence(run('an', [sol(150)]), 'an').points).toBe(2);
    expect(gradePhysSequence(run('an', [sol(150), sol(100)]), 'an').points).toBe(1);
    expect(gradePhysSequence(run('ur', [sol(100), sol(150)]), 'ur').points).toBe(2);
    expect(gradePhysSequence(run('kc', [sol(50)]), 'kc').points).toBe(0);
    expect(gradePhysSequence(run('kc', [rh(85), rh(80)]), 'kc').points).toBe(2);
    expect(gradePhysSequence(run('as', [{ kind: 'look' }, sol(50), sol(100)]), 'as').points).toBe(2);
  });
  it('висновок: добриво + обґрунтування = 2 бали; без однозначного визначення — 0', () => {
    const log = run('kn', [rh(95), rh(85)]);
    const j = correctPhysJustId(log);
    expect(gradePhysConclusion('kn', j, 'kn', log).points).toBe(2);
    expect(gradePhysConclusion('kc', j, 'kn', log).points).toBe(1);
    const opts = makePhysJustifications(log, mulberry32(4));
    expect(new Set(opts.map((o) => o.id)).size).toBe(opts.length);
    const bad = opts.find((o) => o.id !== j) as { id: string };
    expect(gradePhysConclusion('kn', bad.id, 'kn', log).points).toBe(1);
    const weak = run('kn', [rh(95)]);
    expect(gradePhysConclusion('kn', correctPhysJustId(weak), 'kn', weak).points).toBe(0);
  });
  it('ключі тестів унікальні', () => { expect(new Set(ALL_TESTS.map(testKey)).size).toBe(ALL_TESTS.length); expect(SOL_MASSES.length + RH_LEVELS.length + 2).toBe(ALL_TESTS.length); });
});
