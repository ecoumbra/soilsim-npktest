import type { Fertilizer, LogEntry } from '../types';
import { fertilizers } from '../data/fertilizers';
import { reactions } from '../data/reactions';
import { physical } from '../data/physicalProperties';
import { classify, identify } from './identification';
import { identifyPhys, labLabel, labText, resultWord } from './physicalLab';
import type { PhysEntry } from './physicalQuiz';

/** Побудова звіту про лабораторну роботу (чиста логіка — тестується окремо від інтерфейсу). */
export interface ReportData {
  student: string; group: string; date: string; revealed: boolean;
  chem: { attempt: number; log: LogEntry[]; sample: Fertilizer };
  phys: { no: number; attempt: number; log: PhysEntry[]; sample: string };
}
export interface ReportSection { title: string; head: string[]; rows: string[][]; verdict: string; answer: string | null; match: boolean | null }

const WORD = { positive: 'позитивний', negative: 'негативний', uncertain: 'невизначений' } as const;
const names = (l: { name: string }[]) => l.map((f) => f.name).join(', ');
const ionList = (ions: string[]) => (ions.length ? ions.map((i) => reactions[i as keyof typeof reactions].ion.split(' ')[0]).join(', ') : 'жодного з визначуваних йонів');

export function chemSection(d: ReportData['chem'], revealed: boolean): ReportSection {
  const cls = classify(d.log);
  const r = identify(d.log);
  const verdict = r.status === 'unique' ? `Результати відповідають: ${r.candidates[0].name}.`
    : r.status === 'indistinguishable' ? `Результати відповідають кільком добривам з однаковим йонним складом: ${names(r.candidates)}.`
      : r.status === 'contradiction' ? 'Виявлено суперечність між результатами: перевірте чистоту пробірки, послідовність операцій і перешкоди.'
        : 'Наявних результатів недостатньо для однозначної ідентифікації зразка.';
  const ok = r.status === 'unique' || r.status === 'indistinguishable';
  return {
    title: `Якісні реакції · зразок № ${String(d.attempt).padStart(2, '0')}`,
    head: ['Йон', 'Реактив', 'Спостереження', 'Результат'],
    rows: d.log.map((e) => [reactions[e.ion].ion, reactions[e.ion].reagent, e.observation, WORD[cls.get(e.ion) ?? 'negative']]),
    verdict,
    answer: revealed ? `Правильна відповідь: ${d.sample.name} (${d.sample.formula}). Склад за аналітичною матрицею: ${ionList(d.sample.ions)}.` : null,
    match: revealed ? ok && r.candidates.some((c) => c.id === d.sample.id) : null,
  };
}

export function physSection(d: ReportData['phys'], revealed: boolean): ReportSection {
  const r = identifyPhys(d.log);
  const f = fertilizers.find((x) => x.id === d.sample) as Fertilizer;
  const p = physical[d.sample];
  const fl = r.candidates.map((id) => fertilizers.find((x) => x.id === id) as Fertilizer);
  return {
    title: `Фізичні властивості · зразок № ${String(d.no).padStart(2, '0')}`,
    head: ['Дослідження', 'Спостереження', 'Результат'],
    rows: d.log.map((e) => [labLabel(e.test), labText(e), resultWord(e)]),
    verdict: r.status === 'unique' ? `Результати відповідають: ${fl[0].name}.` : `Наявних результатів недостатньо: можливі добрива — ${names(fl)}.`,
    answer: revealed ? `Правильна відповідь: ${f.name} (${f.formula}). Довідково: розчинність ≈ ${p.solubility20} г/100 мл (20 °C), CRH ≈ ${p.crh30} % (30 °C).` : null,
    match: revealed ? r.status === 'unique' && r.candidates[0] === d.sample : null,
  };
}

export function reportToText(d: ReportData): string {
  const out: string[] = ['AgroSim — звіт про лабораторну роботу', `Студент: ${d.student || '—'}`, `Група: ${d.group || '—'}`, `Дата: ${d.date}`, ''];
  for (const s of [chemSection(d.chem, d.revealed), physSection(d.phys, d.revealed)]) {
    out.push(s.title, '-'.repeat(s.title.length));
    if (!s.rows.length) out.push('Досліджень не проведено.');
    s.rows.forEach((r, i) => out.push(`${i + 1}. ${r.join(' | ')}`));
    out.push(`Висновок: ${s.verdict}`);
    if (s.answer) out.push(s.answer, s.match ? 'Ваш результат збігається з правильною відповіддю.' : 'Ваш результат не дозволяє підтвердити правильну відповідь.');
    out.push('');
  }
  return out.join('\n');
}
