import type { Fertilizer } from '../types';
/** ions — йони, які виявляються якісними реакціями у розчині добрива. */
export const fertilizers: Fertilizer[] = [
  { id: 'an', name: 'Амонійна селітра', formula: 'NH₄NO₃', ions: ['NH4', 'NO3'] },
  { id: 'as', name: 'Сульфат амонію', formula: '(NH₄)₂SO₄', ions: ['NH4', 'SO4'] },
  { id: 'ac', name: 'Хлорид амонію', formula: 'NH₄Cl', ions: ['NH4', 'Cl'] },
  { id: 'kn', name: 'Калійна селітра', formula: 'KNO₃', ions: ['K', 'NO3'] },
  { id: 'kc', name: 'Хлорид калію', formula: 'KCl', ions: ['K', 'Cl'] },
  { id: 'ks', name: 'Сульфат калію', formula: 'K₂SO₄', ions: ['K', 'SO4'] },
  { id: 'ss', name: 'Простий суперфосфат', formula: 'Ca(H₂PO₄)₂ + CaSO₄ + домішки', ions: ['Ca', 'PO4', 'SO4'], note: 'Товарне добриво — суміш; гіпс дає реакцію на сульфат.' },
  { id: 'ds', name: 'Подвійний суперфосфат', formula: 'переважно Ca(H₂PO₄)₂', ions: ['Ca', 'PO4'] },
  { id: 'map', name: 'Моноамонійфосфат', formula: 'NH₄H₂PO₄', ions: ['NH4', 'PO4'] },
  { id: 'dap', name: 'Діамонійфосфат', formula: '(NH₄)₂HPO₄', ions: ['NH4', 'PO4'], note: 'Від MAP відрізняється pH розчину, а не йонним складом.' },
  { id: 'ur', name: 'Сечовина', formula: 'CO(NH₂)₂', ions: [], note: 'NH₄⁺ немає. Уреазний гідроліз — теоретична демонстрація (методика не верифікована).' },
];
