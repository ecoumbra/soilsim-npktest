import { describe, expect, it } from 'vitest';
import { fertilizers } from '../src/data/fertilizers';
import { IONS } from '../src/data/analyticalMatrix';
import { reactions } from '../src/data/reactions';
import {
  MAX_POINTS, POINTS, correctJustificationId, gradeConclusion, gradeIdentification, gradeInterpretation, gradeReagent, gradeSequence,
  makeIdentificationQuestion, makeInterpretationQuestion, makeJustifications, makeLabTask, makeReagentQuestion, mulberry32, runTest, totalScore,
} from '../src/engine/quiz';
import { identify } from '../src/engine/identification';
import type { Fertilizer, IonId } from '../src/types';

const byId = (id: string) => fertilizers.find((f) => f.id === id) as Fertilizer;
const logOf = (f: Fertilizer, ions: IonId[]) => ions.map((i) => runTest(i, f));

describe('оцінювання', () => {
  it('максимум 10 балів: 1+2+3+3+1', () => {
    expect(MAX_POINTS).toBe(10);
    expect(totalScore({ reagent: 1, interpretation: 2, identification: 3, sequence: 3, conclusion: 1 })).toBe(10);
  });
});

describe('тип 1: реактив', () => {
  it('варіанти унікальні, містять правильний; правильна відповідь — 1 бал', () => {
    for (const ion of IONS) {
      const q = makeReagentQuestion(mulberry32(7), ion);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(ion);
      expect(gradeReagent(q, ion).points).toBe(POINTS.reagent);
    }
  });
  it('неправильний реактив — 0 балів і пояснення хімічної суті', () => {
    const q = makeReagentQuestion(mulberry32(1), 'NH4');
    const g = gradeReagent(q, 'SO4');
    expect(g.points).toBe(0);
    expect(g.explanation).toContain('SO₄²⁻');
  });
});

describe('тип 2: інтерпретація', () => {
  it('кожен сценарій відповідає своєму йону (2 бали), інакше пояснення', () => {
    for (const ion of IONS) {
      const q = makeInterpretationQuestion(mulberry32(3), ion);
      expect(q.scenario.length).toBeGreaterThan(10);
      expect(gradeInterpretation(q, ion).points).toBe(POINTS.interpretation);
      const other = IONS.find((i) => i !== ion) as IonId;
      const g = gradeInterpretation(q, other);
      expect(g.points).toBe(0);
      expect(g.explanation).toContain(reactions[ion].ion);
    }
  });
});

describe('тип 3: встановлення добрива', () => {
  it('для кожного добрива результати ідентифікують його, відповідь зараховується (3 бали)', () => {
    for (const f of fertilizers) {
      const q = makeIdentificationQuestion(mulberry32(11), f.id);
      const log = q.results.map((r) => ({ ion: r.ion, positive: r.positive, observation: '' }));
      expect(identify(log).candidates.map((c) => c.id)).toContain(f.id);
      expect(q.options).toContain(f.id);
      expect(gradeIdentification(q, f.id).points).toBe(POINTS.identification);
      const wrong = q.options.find((o) => o !== f.id) as string;
      expect(gradeIdentification(q, wrong).points).toBe(0);
    }
  });
  it('MAP і DAP взаємозамінні', () => {
    const q = makeIdentificationQuestion(mulberry32(5), 'map');
    expect(gradeIdentification(q, 'dap').points).toBe(POINTS.identification);
  });
  it('амонійні зразки не показують пробу на K⁺', () => {
    const q = makeIdentificationQuestion(mulberry32(5), 'an');
    expect(q.results.some((r) => r.ion === 'K')).toBe(false);
  });
});

describe('тип 4: послідовність і висновок', () => {
  it('ідеальна послідовність для NH₄NO₃ — 3 бали', () => {
    const f = byId('an');
    const g = gradeSequence(logOf(f, ['NH4', 'SO4', 'Cl', 'NO3']), f);
    expect(g.points).toBe(3);
    expect(g.notes).toEqual([]);
  });
  it('мало досліджень — немає балів за кількість і достатність', () => {
    const f = byId('an');
    const g = gradeSequence(logOf(f, ['NH4', 'NO3']), f);
    expect(g.points).toBeLessThan(3);
    expect(g.checks[0].ok).toBe(false);
  });
  it('зайвий крок знижує бал', () => {
    const f = byId('an');
    const g = gradeSequence(logOf(f, ['NH4', 'SO4', 'Cl', 'NO3', 'Ca']), f);
    expect(g.checks[2].ok).toBe(false);
    expect(g.points).toBe(2);
  });
  it('проба на K⁺ до перевірки NH₄⁺ зараховується як помилка послідовності', () => {
    const f = byId('kc');
    const bad = gradeSequence(logOf(f, ['K', 'NH4', 'Cl', 'SO4']), f);
    const good = gradeSequence(logOf(f, ['NH4', 'K', 'SO4', 'Cl']), f);
    expect(bad.checks[2].ok).toBe(false);
    expect(bad.notes.join(' ')).toContain('NH₄⁺');
    expect(good.points).toBe(3);
  });
  it('варіанти обґрунтування: 4 унікальні, правильний відповідає журналу', () => {
    const f = byId('an');
    const log = logOf(f, ['NH4', 'SO4', 'Cl', 'NO3']);
    const js = makeJustifications(log, mulberry32(9));
    expect(new Set(js.map((j) => j.id)).size).toBe(js.length);
    expect(js.length).toBe(4);
    expect(js.map((j) => j.id)).toContain(correctJustificationId(log));
  });
  it('висновок: правильне добриво + правильне обґрунтування = 1 бал', () => {
    const f = byId('an');
    const log = logOf(f, ['NH4', 'SO4', 'Cl', 'NO3']);
    const id = correctJustificationId(log);
    expect(gradeConclusion('an', id, f, log).points).toBe(1);
    expect(gradeConclusion('as', id, f, log).points).toBe(0);
    const wrongJust = makeJustifications(log, mulberry32(2)).find((j) => j.id !== id) as { id: string };
    expect(gradeConclusion('an', wrongJust.id, f, log).points).toBe(0);
  });
  it('висновок без достатніх даних не зараховується', () => {
    const f = byId('an');
    const log = logOf(f, ['NH4']);
    expect(gradeConclusion('an', correctJustificationId(log), f, log).points).toBe(0);
  });
  it('сечовина: усі проби негативні, висновок можливий', () => {
    const f = byId('ur');
    const log = logOf(f, ['NH4', 'NO3', 'SO4']);
    expect(gradeSequence(log, f).points).toBeGreaterThanOrEqual(2);
    expect(makeLabTask(mulberry32(1), 'ur').sample.id).toBe('ur');
  });
});
