import type { IonId, ReagentId } from '../types';
import { reactions, reagents } from '../data/reactions';
import { IONS } from '../data/analyticalMatrix';

/** Логіка навчального протоколу: послідовність операцій для виявлення кожного йона. */
export type Action = { kind: 'take' } | { kind: 'heat' } | { kind: 'reagent'; reagent: ReagentId };
export interface Step { action: Action; purpose: string }
export type LabMode = 'guided' | 'free';

const take: Step = { action: { kind: 'take' }, purpose: 'Для кожного тесту потрібна чиста пробірка з невеликою кількістю розчину зразка.' };
const add = (reagent: ReagentId, purpose: string): Step => ({ action: { kind: 'reagent', reagent }, purpose });
const heat = (purpose: string): Step => ({ action: { kind: 'heat' }, purpose });

export const PROTOCOLS: Record<IonId, Step[]> = {
  NH4: [take,
    add('NaOH', 'Луг витісняє з солей амонію вільний аміак: NH₄⁺ + OH⁻ → NH₃ + H₂O.'),
    heat('Нагрівання виганяє NH₃ з розчину; газ виявляють вологим червоним лакмусом.')],
  NO3: [take,
    add('FeSO4', 'Йони Fe²⁺ згодом зв’яжуть оксид азоту(II) у забарвлений комплекс.'),
    add('H2SO4', 'Кислота по стінці утворює нижній шар; на межі шарів з’являється буре кільце.')],
  PO4: [take,
    add('Mo', 'Амоній молібдат у кислому середовищі осаджує фосфат у вигляді фосфомолібдату.'),
    heat('Помірне нагрівання (≈40–50 °C) прискорює утворення жовтого осаду.')],
  K: [take,
    add('Co', 'Гексанітритокобальтат(III) натрію осаджує K⁺ як жовтий K₂Na[Co(NO₂)₆]. Пам’ятайте: NH₄⁺ дає такий самий осад.')],
  SO4: [take,
    add('BaCl2', 'Йони Ba²⁺ осаджують сульфат у вигляді білого BaSO₄.'),
    add('HCl', 'Розбавлена HCl відрізняє BaSO₄ (не розчиняється) від осадів фосфату чи карбонату барію.')],
  Cl: [take,
    add('AgNO3', 'Йони Ag⁺ осаджують хлорид у вигляді білого сирнистого AgCl.'),
    add('NH3', 'AgCl розчиняється в розчині NH₃ з утворенням [Ag(NH₃)₂]⁺ — це підтверджує хлорид.')],
  Ca: [take,
    add('Ox', 'Оксалат-іон осаджує Ca²⁺ у вигляді білого CaC₂O₄.')],
};

const same = (a: Action, b: Action): boolean =>
  a.kind === b.kind && (a.kind !== 'reagent' || (b.kind === 'reagent' && a.reagent === b.reagent));

export function describeAction(a: Action): string {
  if (a.kind === 'take') return 'Взяти пробу зразка';
  if (a.kind === 'heat') return 'Обережно нагріти пробірку';
  return `Додати ${reagents[a.reagent].label}`;
}

/** Який йон виявляє (або підтверджує) реактив. */
export function ionOfReagent(r: ReagentId): IonId | null {
  return IONS.find((i) => reactions[i].reagents.includes(r)) ?? null;
}

export type Check = { ok: true } | { ok: false; reason: string };

/** Чи придатний реактив для виявлення обраного йона; якщо ні — пояснення чому. */
export function checkReagentForIon(ion: IonId, r: ReagentId): Check {
  if (reactions[ion].reagents.includes(r)) return { ok: true };
  const other = ionOfReagent(r);
  const verb = r === 'HCl' || r === 'NH3' ? 'застосовують лише для підтвердження результату на' : 'виявляє';
  const target = other ? reactions[other].ion : 'інший йон';
  return { ok: false, reason: `${reagents[r].label} ${verb} ${target}, тому не дає змоги перевірити ${reactions[ion].ion}. Для ${reactions[ion].ion} застосовують: ${reactions[ion].reagent}.` };
}

export type Advance = { ok: true; next: number; done: boolean } | { ok: false; reason: string };

/** Покроковий режим: чи відповідає дія поточному кроку протоколу. */
export function advance(ion: IonId, index: number, action: Action): Advance {
  const steps = PROTOCOLS[ion];
  if (index >= steps.length) return { ok: false, reason: 'Протокол виконано. Візьміть чисту пробірку або оберіть інший йон.' };
  const cur = steps[index];
  if (same(action, cur.action)) return { ok: true, next: index + 1, done: index + 1 === steps.length };
  const later = steps.some((s, i) => i > index && same(s.action, action));
  let why: string;
  if (action.kind === 'reagent') {
    const c = checkReagentForIon(ion, action.reagent);
    why = !c.ok ? c.reason : later ? 'Ще зарано для цього реактиву.' : 'Цей реактив уже використано.';
  } else if (action.kind === 'heat') {
    why = later ? 'Ще зарано нагрівати.' : 'Нагрівання в цьому тесті не потрібне або вже виконано.';
  } else why = 'Пробу вже взято.';
  return { ok: false, reason: `${why} Зараз за протоколом: ${describeAction(cur.action)}. ${cur.purpose}` };
}
