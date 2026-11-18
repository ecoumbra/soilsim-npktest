import { describe, expect, it } from 'vitest';
import { fertilizers } from '../src/data/fertilizers';
import { IONS } from '../src/data/analyticalMatrix';
import { evaluateTest } from '../src/engine/qualitativeAnalysis';
import { ALL_TESTS, runPhysTest } from '../src/engine/physicalQuiz';
import { chemSection, physSection, reportToText, type ReportData } from '../src/engine/report';

const f = (id: string) => fertilizers.find((x) => x.id === id)!;
const chemLog = (id: string) => IONS.map((ion) => ({ ion, positive: evaluateTest(ion, f(id)).positive, observation: 'obs' }));
const base = (over: Partial<ReportData> = {}): ReportData => ({
  student: 'Іваненко І.', group: 'АГ-31', date: '18.11.2026', revealed: false,
  chem: { attempt: 4, log: chemLog('an'), sample: f('an') },
  phys: { no: 7, attempt: 1, log: ALL_TESTS.map((t) => runPhysTest(t, 'kn')), sample: 'kn' }, ...over,
});

describe('звіт', () => {
  it('до завершення правильна відповідь прихована', () => {
    expect(chemSection(base().chem, false).answer).toBe(null);
    expect(physSection(base().phys, false).answer).toBe(null);
    expect(reportToText(base())).not.toContain('Правильна відповідь');
  });
  it('після завершення показано відповідь і збіг з висновком', () => {
    const c = chemSection(base().chem, true);
    expect(c.answer).toContain('Амонійна селітра');
    expect(c.match).toBe(true);
    const p = physSection(base().phys, true);
    expect(p.answer).toContain('Калійна селітра');
    expect(p.match).toBe(true);
    expect(reportToText(base({ revealed: true }))).toContain('збігається');
  });
  it('порожній журнал: недостатньо даних, збігу немає', () => {
    const d = base({ chem: { attempt: 1, log: [], sample: f('an') }, phys: { no: 1, attempt: 1, log: [], sample: 'an' } });
    expect(chemSection(d.chem, true).verdict).toContain('недостатньо');
    expect(chemSection(d.chem, true).match).toBe(false);
    expect(physSection(d.phys, true).match).toBe(false);
    expect(reportToText(d)).toContain('Досліджень не проведено.');
  });
  it('у тексті є ім’я студента, група й дата', () => {
    const t = reportToText(base());
    for (const s of ['Іваненко І.', 'АГ-31', '18.11.2026']) expect(t).toContain(s);
  });
});
