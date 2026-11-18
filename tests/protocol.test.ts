import { describe, expect, it } from 'vitest';
import { IONS } from '../src/data/analyticalMatrix';
import { fertilizers } from '../src/data/fertilizers';
import { reactions } from '../src/data/reactions';
import { applyHeat, applyReagent, emptyTube, fillTube } from '../src/engine/experimentValidation';
import { evaluateTest } from '../src/engine/qualitativeAnalysis';
import { PROTOCOLS, advance, checkReagentForIon, describeAction, ionOfReagent, type Action } from '../src/engine/protocol';
import type { Fertilizer, LogEntry, Outcome, TubeState } from '../src/types';

const run = (a: Action, t: TubeState, s: Fertilizer): Outcome =>
  a.kind === 'take' ? fillTube(t) : a.kind === 'heat' ? applyHeat(t, s) : applyReagent(t, a.reagent, s);

describe('протоколи', () => {
  it('починаються з проби й містять усі реактиви реакції', () => {
    for (const ion of IONS) {
      const steps = PROTOCOLS[ion];
      expect(steps[0].action.kind).toBe('take');
      const used = steps.flatMap((s) => (s.action.kind === 'reagent' ? [s.action.reagent] : []));
      expect([...used].sort()).toEqual([...reactions[ion].reagents].sort());
    }
  });
  it('повний протокол, виконаний через engine, дає результат для кожного йона і зразка', () => {
    for (const ion of IONS) for (const f of fertilizers) {
      let tube = emptyTube();
      let entry: LogEntry | undefined;
      PROTOCOLS[ion].forEach((step, i) => {
        const adv = advance(ion, i, step.action);
        expect(adv.ok, `${ion}/${f.id}/${i}`).toBe(true);
        const out = run(step.action, tube, f);
        tube = out.tube;
        entry = out.entry ?? entry;
      });
      expect(entry?.ion, `${ion}/${f.id}`).toBe(ion);
      expect(entry?.positive, `${ion}/${f.id}`).toBe(evaluateTest(ion, f).positive);
    }
  });
});

describe('покроковий режим: блокування', () => {
  it('просування по кроках', () => {
    const a = advance('NH4', 0, { kind: 'take' });
    expect(a.ok).toBe(true);
    if (a.ok) { expect(a.next).toBe(1); expect(a.done).toBe(false); }
    const last = advance('NH4', 2, { kind: 'heat' });
    expect(last.ok && last.done).toBe(true);
  });
  it('нагрівання до додавання реактиву заблоковано з поясненням', () => {
    const r = advance('NH4', 1, { kind: 'heat' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain(describeAction({ kind: 'reagent', reagent: 'NaOH' }));
  });
  it('реактив іншого йона заблоковано й названо його справжнє призначення', () => {
    const r = advance('NH4', 1, { kind: 'reagent', reagent: 'BaCl2' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('SO₄²⁻');
  });
  it('H₂SO₄ раніше FeSO₄ — зарано', () => {
    const r = advance('NO3', 1, { kind: 'reagent', reagent: 'H2SO4' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('зарано');
  });
  it('після завершення протоколу дії блокуються', () => {
    expect(advance('Ca', 2, { kind: 'take' }).ok).toBe(false);
  });
});

describe('самостійний режим: пояснення неправильного реактиву', () => {
  it('відповідність реактивів і йонів', () => {
    expect(ionOfReagent('FeSO4')).toBe('NO3');
    expect(ionOfReagent('Ox')).toBe('Ca');
    expect(checkReagentForIon('Cl', 'AgNO3').ok).toBe(true);
  });
  it('BaCl₂ для NH₄⁺ — відмова з поясненням', () => {
    const c = checkReagentForIon('NH4', 'BaCl2');
    expect(c.ok).toBe(false);
    if (!c.ok) { expect(c.reason).toContain('SO₄²⁻'); expect(c.reason).toContain('NaOH'); }
  });
  it('NH₃ не є самостійним реактивом на йон', () => {
    const c = checkReagentForIon('NH4', 'NH3');
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.reason).toContain('підтвердження');
  });
});
