export type IonId = 'NH4' | 'NO3' | 'PO4' | 'K' | 'SO4' | 'Cl' | 'Ca';
export type ReagentId = 'NaOH' | 'FeSO4' | 'H2SO4' | 'Mo' | 'Co' | 'BaCl2' | 'HCl' | 'AgNO3' | 'NH3' | 'Ox';
export type Hazard = 'low' | 'medium' | 'high';
export type Effect = 'gas' | 'ring' | 'precipitate';

/** Рівняння — ASCII-запис: "Ag^+ + Cl^- -> AgCl". Баланс атомів і зарядів перевіряють тести. */
export interface Reaction {
  id: IonId; ion: string; name: string; reagent: string; reagents: ReagentId[];
  conditions: string; method: string; obsPositive: string; obsNegative: string;
  /** Опис досліду для завдань на інтерпретацію (названо реактив і ознаку) */
  scenario: string;
  equations: string[]; equationNote?: string; significance: string; interferences: string;
  effect: Effect; color?: string; hazard: Hazard; hazardNote: string; refs: string[];
  /** false — потребує звірки з підручником перед використанням у навчанні */
  verified: boolean;
}
export interface Fertilizer { id: string; name: string; formula: string; ions: IonId[]; note?: string }
export interface LogEntry { ion: IonId; positive: boolean; observation: string }
export interface TubeState {
  filled: boolean; reagents: ReagentId[]; heated: boolean; done: IonId[]; gas: boolean; ring: boolean;
  precipitate: string | null; dissolved: boolean; paper: 'none' | 'red' | 'blue'; confirm: IonId | null; replay: number;
}
export interface Outcome { tube: TubeState; message: string; entry?: LogEntry }
export interface ArchivedTube { tube: TubeState; ion: IonId; positive: boolean }
