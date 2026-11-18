/**
 * Фізичні властивості добрив для тесту «Фізичні властивості».
 * УВАГА: числа взято з вторинних джерел (див. references.ts) → verified: false; звірити з CRC Handbook / Adams–Merz (1929).
 * solubility20 — г на 100 мл води при 20 °C; crh30 — критична відносна вологість при 30 °C, %.
 * null = достовірних узгоджених даних немає (суміші суперфосфатів; для DAP розчинність у джерелах розходиться: 57,5 і 68,9;
 * для MAP і DAP розходиться CRH — див. ref-crh-conflict) → у числових завданнях не використовується.
 */
export interface PhysProps {
  id: string; look: string; solubility20: number | null; crh30: number | null;
  /** Реакція розчину на універсальний індикатор: true — слабокисла (гідроліз NH₄⁺), false — нейтральна (сіль сильної кислоти й основи / сечовина). Якісна оцінка з хімії, числові pH не верифіковано. null — не визначається цим тестом. */
  acidic: boolean | null;
  /** Числовий/описовий pH за джерелами (лише там, де джерела узгоджені) */
  phText?: string;
  verified: boolean; refs: string[];
}

export const physical: Record<string, PhysProps> = {
  an: { id: 'an', look: 'білі гранули', solubility20: 192, crh30: 59.4, acidic: true, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  as: { id: 'as', look: 'білі або безбарвні кристали (товарні партії бувають забарвлені)', solubility20: 75.4, crh30: 79.2, acidic: true, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  ac: { id: 'ac', look: 'білі кристали', solubility20: 37.2, crh30: 77.2, acidic: true, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  kn: { id: 'kn', look: 'білі кристали', solubility20: 31.6, crh30: 90.5, acidic: false, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  kc: { id: 'kc', look: 'білі або червонувато-рожеві кристали чи гранули (залежить від родовища)', solubility20: 34.2, crh30: 84.0, acidic: false, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  ks: { id: 'ks', look: 'білі кристали', solubility20: 11.1, crh30: 96.3, acidic: false, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  ur: { id: 'ur', look: 'білі блискучі сферичні гранули (прили) або світліші неправильні гранули', solubility20: 108, crh30: 72.5, acidic: false, verified: false, refs: ['ref-solubility-table', 'ref-crh-adams'] },
  ss: { id: 'ss', look: 'сірий порошок або гранули (від коричневого до темно-сірого)', solubility20: null, crh30: null, acidic: null, verified: false, refs: ['ref-colour'] },
  ds: { id: 'ds', look: 'сірі гранули', solubility20: null, crh30: null, acidic: null, verified: false, refs: ['ref-colour'] },
  map: { id: 'map', look: 'світлі або сіруваті гранули', solubility20: 37.4, crh30: null, acidic: null, phText: '≈ 4,0–4,5 (кислий)', verified: false, refs: ['ref-map-ph', 'ref-crh-conflict'] },
  dap: { id: 'dap', look: 'гранули від світло-коричневого до чорного кольору (колір залежить від сировини)', solubility20: null, crh30: null, acidic: null, phText: '≈ 7,5–8,0 (слабколужний)', verified: false, refs: ['ref-dap-ph', 'ref-crh-conflict', 'ref-colour'] },
};

/** Добрива з узгодженими даними і розчинності, і CRH — для віртуальної лабораторної задачі. */
export const LAB_POOL = ['an', 'as', 'ac', 'kn', 'kc', 'ks', 'ur'] as const;

export interface Clue { id: string; text: string; answer: string; pool: string[]; why: string }
/** Ознаки для завдань «властивість → добриво». Кожне — однозначне серед варіантів із pool. */
export const CLUES: Clue[] = [
  { id: 'ph-acid', answer: 'map', pool: ['dap', 'kc', 'ks', 'kn'],
    text: 'Добриво містить і азот, і фосфор. Водний розчин кислий: pH ≈ 4,0–4,5.',
    why: 'Це моноамонійфосфат NH₄H₂PO₄ (pH розчину ≈ 4,0–4,5). DAP дає лужніший розчин (pH ≈ 7,5–8,0), а KCl і K₂SO₄ — солі сильної кислоти й сильної основи, їхні розчини близькі до нейтральних.' },
  { id: 'ph-alk', answer: 'dap', pool: ['map', 'kc', 'ks', 'kn'],
    text: 'Добриво містить азот і фосфор. Розчин слабколужний (pH ≈ 7,5–8,0); поблизу гранул у ґрунті можливе виділення аміаку, що шкодить сходам.',
    why: 'Це діамонійфосфат (NH₄)₂HPO₄: іон HPO₄²⁻ гідролізує з утворенням OH⁻, тому розчин лужний. MAP дає кислий розчин (pH ≈ 4,0–4,5).' },
  { id: 'grey-ssp', answer: 'ss', pool: ['an', 'ur', 'ks', 'as', 'kn'],
    text: 'Сірі гранули або порошок; містять гіпс CaSO₄·2H₂O, тому у воді розчиняються лише частково.',
    why: 'Це простий суперфосфат: сірий колір успадковано від фосфориту, а гіпс малорозчинний (≈ 0,26 г на 100 мл води). Азотні й калійні солі з переліку — білі та добре розчинні.' },
  { id: 'ur-108', answer: 'ur', pool: ['an', 'as', 'kc', 'ks'],
    text: 'Білі блискучі сферичні гранули (прили); розчинність у воді при 20 °C ≈ 108 г на 100 мл; CRH ≈ 72,5 % (30 °C).',
    why: 'Це сечовина: розчинність ≈ 108 г/100 мл. Амонійна селітра розчиняється значно краще (≈ 192), а (NH₄)₂SO₄ — гірше (≈ 75).' },
  { id: 'an-192', answer: 'an', pool: ['ur', 'as', 'kn', 'ks'],
    text: 'Розчинність у воді при 20 °C близько 190 г на 100 мл і дуже низька CRH ≈ 59 % (30 °C): швидко відсирює на повітрі.',
    why: 'Це амонійна селітра NH₄NO₃ — найбільш розчинна й найгігроскопічніша серед варіантів (CRH ≈ 59,4 %).' },
  { id: 'ks-11', answer: 'ks', pool: ['kc', 'kn', 'as', 'ur'],
    text: 'Білі кристали; розчинність лише ≈ 11 г на 100 мл води при 20 °C; майже не поглинає вологу з повітря (CRH ≈ 96 % при 30 °C).',
    why: 'Це калій сульфат K₂SO₄: найменш розчинний (≈ 11 г/100 мл) і найменш гігроскопічний серед варіантів.' },
  { id: 'as-75', answer: 'as', pool: ['ur', 'ac', 'kn', 'kc'],
    text: 'Білі (або слабко забарвлені) кристали; розчинність ≈ 75 г на 100 мл води при 20 °C; містить азот в амонійній формі та сірку.',
    why: 'Це сульфат амонію (NH₄)₂SO₄: єдиний з варіантів, що містить сірку; розчинність ≈ 75 г/100 мл.' },
  { id: 'kc-red', answer: 'kc', pool: ['ks', 'ur', 'an', 'as'],
    text: 'Кристали або гранули білого чи червонуватого кольору (залежить від родовища); розчинність ≈ 34 г на 100 мл води при 20 °C; азоту не містить.',
    why: 'Це калій хлорид KCl: колір змінний (білий або червонуватий через домішки), азоту немає; розчинність ≈ 34 г/100 мл. K₂SO₄ розчиняється значно гірше (≈ 11).' },
];
