import type { ReagentId } from '../../types';

/** Візуальні (не хімічні) властивості посуду й реактивів: вигляд флаконів і колір розчинів. */
export interface BottleVisual { short: string; sub: string; liquid: string; glass: 'clear' | 'amber'; kind: 'dropper' | 'stopper'; fs: number }

export const bottles: Record<ReagentId, BottleVisual> = {
  NaOH: { short: 'NaOH', sub: 'розчин', liquid: '#d6eaf6', glass: 'clear', kind: 'dropper', fs: 9.5 },
  FeSO4: { short: 'FeSO₄', sub: 'розчин', liquid: '#b9dcae', glass: 'clear', kind: 'dropper', fs: 9 },
  H2SO4: { short: 'H₂SO₄', sub: 'конц.', liquid: '#ece2bb', glass: 'clear', kind: 'stopper', fs: 9 },
  Mo: { short: '(NH₄)₂MoO₄', sub: 'у HNO₃', liquid: '#e3ebfa', glass: 'clear', kind: 'dropper', fs: 6.4 },
  Co: { short: 'Na₃[Co(NO₂)₆]', sub: 'розчин', liquid: '#f0be45', glass: 'clear', kind: 'dropper', fs: 5.6 },
  BaCl2: { short: 'BaCl₂', sub: 'розчин', liquid: '#dcebf5', glass: 'clear', kind: 'dropper', fs: 9 },
  HCl: { short: 'HCl', sub: 'розб.', liquid: '#e1eef6', glass: 'clear', kind: 'dropper', fs: 10 },
  AgNO3: { short: 'AgNO₃', sub: 'розчин', liquid: '#d9cfae', glass: 'amber', kind: 'dropper', fs: 9 },
  NH3: { short: 'NH₃', sub: 'розчин', liquid: '#dcebf5', glass: 'clear', kind: 'stopper', fs: 10 },
  Ox: { short: '(NH₄)₂C₂O₄', sub: 'розчин', liquid: '#e1edf5', glass: 'clear', kind: 'dropper', fs: 6 },
};

/** Забарвлення розчину в пробірці після додавання реактиву (лише якщо реактив забарвлений). */
export const tubeTint: Partial<Record<ReagentId, string>> = { FeSO4: '#cfe6c4', Co: '#f5da8c' };
