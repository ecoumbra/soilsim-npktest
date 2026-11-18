import { describe, expect, it } from 'vitest';
import { reactions } from '../src/data/reactions';
import { fertilizers } from '../src/data/fertilizers';
import { IONS, matrix } from '../src/data/analyticalMatrix';
import { atoms, isBalanced, pretty } from '../src/engine/equations';
import { evaluateTest } from '../src/engine/qualitativeAnalysis';
import type { Fertilizer, IonId } from '../src/types';

const byId = (id: string) => fertilizers.find((f) => f.id === id) as Fertilizer;
const positives = (f: Fertilizer) => IONS.filter((i) => evaluateTest(i, f).positive);

describe('рівняння', () => {
  it('парсер формул', () => {
    expect(atoms('(NH4)3PMo12O40')).toEqual({ N: 3, H: 12, P: 1, Mo: 12, O: 40 });
    expect(atoms('Co(NO2)6')).toEqual({ Co: 1, N: 6, O: 12 });
  });
  it('усі рівняння збалансовані за атомами й зарядами', () => {
    for (const r of Object.values(reactions)) for (const eq of r.equations) expect(isBalanced(eq), eq).toBe(true);
  });
  it('виявляє небаланс', () => {
    expect(isBalanced('Ag^+ + Cl^- -> AgCl2')).toBe(false);
    expect(isBalanced('Ca^2+ + C2O4^2- -> CaC2O4^2-')).toBe(false);
  });
  it('форматування', () => {
    expect(pretty('2K^+ + Na^+ -> K2Na')).toBe('2K⁺ + Na⁺ → K₂Na');
  });
});

describe('база реакцій', () => {
  it('кожен йон має реакцію з реактивом і джерелом', () => {
    for (const ion of IONS) {
      expect(reactions[ion].reagents.length).toBeGreaterThan(0);
      expect(reactions[ion].refs.length).toBeGreaterThan(0);
    }
  });
});

describe('матриця добрив', () => {
  const expected: Record<string, IonId[]> = {
    an: ['NH4', 'NO3'], as: ['NH4', 'SO4'], ac: ['NH4', 'Cl'], kn: ['K', 'NO3'], kc: ['K', 'Cl'], ks: ['K', 'SO4'],
    ss: ['Ca', 'PO4', 'SO4'], ds: ['Ca', 'PO4'], map: ['NH4', 'PO4'], dap: ['NH4', 'PO4'], ur: [],
  };
  for (const [id, ions] of Object.entries(expected)) {
    it(`склад ${id}`, () => {
      const f = byId(id);
      expect([...f.ions].sort()).toEqual([...ions].sort());
      for (const i of ions) expect(matrix[id][i]).toBe(true);
    });
  }
  it('позитивні результати відповідають складу (K⁺ у амонійних солях — перешкода)', () => {
    expect(positives(byId('an'))).toEqual(expect.arrayContaining(['NH4', 'NO3']));
    expect(positives(byId('kn'))).toEqual(expect.arrayContaining(['K', 'NO3']));
    expect(positives(byId('kc'))).not.toContain('NH4');
    expect(positives(byId('ac'))).toContain('K'); // хибнопозитивна перешкода
  });
  it('сечовина не дає прямої реакції на NH₄⁺ і жодного іншого тесту', () => {
    expect(positives(byId('ur'))).toEqual([]);
  });
  it('фосфатні добрива дають реакцію на фосфат', () => {
    for (const id of ['ss', 'ds', 'map', 'dap']) expect(evaluateTest('PO4', byId(id)).positive).toBe(true);
  });
});
