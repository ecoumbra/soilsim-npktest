import type { Fertilizer, IonId, Outcome, ReagentId, TubeState } from '../types';
import { reactions } from '../data/reactions';
import { evaluateTest } from './qualitativeAnalysis';

const ACTIVE: ReagentId[] = ['NaOH', 'FeSO4', 'Mo', 'Co', 'BaCl2', 'AgNO3', 'Ox'];
const TEST_OF: Partial<Record<ReagentId, IonId>> = { Mo: 'PO4', Co: 'K', BaCl2: 'SO4', AgNO3: 'Cl', Ox: 'Ca' };

export const emptyTube = (): TubeState => ({
  filled: false, reagents: [], heated: false, done: [], gas: false, ring: false,
  precipitate: null, dissolved: false, paper: 'none', confirm: null, replay: 0,
});

export const fillTube = (tube: TubeState): Outcome => ({ tube: { ...tube, filled: true }, message: 'Проба в пробірці. Оберіть реактив.' });

function conclude(tube: TubeState, ion: IonId, sample: Fertilizer): Outcome {
  const rx = reactions[ion];
  const { positive } = evaluateTest(ion, sample);
  const t: TubeState = { ...tube, done: [...tube.done, ion], confirm: positive && (ion === 'SO4' || ion === 'Cl') ? ion : null, replay: tube.replay + 1 };
  if (positive) {
    if (rx.effect === 'gas') { t.gas = true; t.paper = 'blue'; }
    else if (rx.effect === 'ring') t.ring = true;
    else t.precipitate = rx.color ?? '#F8FAFC';
  } else if (ion === 'NH4') t.paper = 'red';
  const observation = positive ? rx.obsPositive : rx.obsNegative;
  let message = observation;
  if (t.confirm === 'SO4') message += ' Додайте розб. HCl для підтвердження.';
  if (t.confirm === 'Cl') message += ' Додайте розчин NH₃ для підтвердження.';
  return { tube: t, message, entry: { ion, positive, observation } };
}

export function applyReagent(tube: TubeState, r: ReagentId, sample: Fertilizer): Outcome {
  const reject = (message: string): Outcome => ({ tube, message });
  if (!tube.filled) return reject('Спочатку візьміть пробу зразка.');
  if (r === 'HCl') {
    return reject(tube.confirm === 'SO4'
      ? 'Осад BaSO₄ не розчинився в розбавленій HCl — це відрізняє його від фосфатів і карбонатів барію.'
      : 'HCl сама не виявляє жодного йона: її використовують для підкислення та підтвердження осаду BaSO₄.');
  }
  if (r === 'NH3') {
    if (tube.confirm === 'Cl') return { tube: { ...tube, dissolved: true, confirm: null, replay: tube.replay + 1 }, message: 'Осад AgCl розчинився з утворенням [Ag(NH₃)₂]⁺ — підтвердження хлориду.' };
    return reject('Розчин NH₃ не виявляє йон у цій пробірці; його застосовують лише для перевірки осаду AgCl.');
  }
  if (r === 'H2SO4') {
    if (!tube.reagents.includes('FeSO4')) return reject('Спочатку потрібен розчин FeSO₄: без нього кільце не утвориться.');
    if (tube.reagents.includes('H2SO4')) return reject('Кислоту вже додано.');
    return conclude({ ...tube, reagents: [...tube.reagents, r] }, 'NO3', sample);
  }
  if (tube.reagents.some((x) => ACTIVE.includes(x))) return reject('У пробірці вже йде інша реакція. Візьміть чисту пробірку — інакше результати неоднозначні.');
  const t: TubeState = { ...tube, reagents: [...tube.reagents, r] };
  if (r === 'NaOH') return { tube: t, message: 'NaOH додано. Обережно нагрійте пробірку й піднесіть вологий червоний лакмус.' };
  if (r === 'FeSO4') return { tube: t, message: 'FeSO₄ додано. Тепер по стінці дуже обережно долийте конц. H₂SO₄.' };
  if (r === 'Mo' && !t.heated) return { tube: t, message: 'Реактив додано. Помірно (≈40–50 °C) підігрійте: осад утворюється поступово.' };
  const ion = TEST_OF[r];
  return ion ? conclude(t, ion, sample) : reject('Невідомий реактив.');
}

export function applyHeat(tube: TubeState, sample: Fertilizer): Outcome {
  if (!tube.filled) return { tube, message: 'Пробірка порожня.' };
  const t: TubeState = { ...tube, heated: true };
  if (t.reagents.includes('NaOH') && !t.done.includes('NH4')) return conclude(t, 'NH4', sample);
  if (t.reagents.includes('Mo') && !t.done.includes('PO4')) return conclude(t, 'PO4', sample);
  return { tube: t, message: 'Нагрівання без реактиву аналітичного ефекту не має. Нагрівайте після додавання NaOH або амоній молібдату.' };
}

export const replayReaction = (tube: TubeState): TubeState => ({ ...tube, dissolved: false, replay: tube.replay + 1 });
