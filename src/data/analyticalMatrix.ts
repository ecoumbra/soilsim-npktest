import type { IonId } from '../types';
import { fertilizers } from './fertilizers';

export const IONS: IonId[] = ['NH4', 'NO3', 'PO4', 'K', 'SO4', 'Cl', 'Ca'];
/** Хибнопозитивні перешкоди: проба на ключ дає позитивний ефект і за наявності йонів зі списку. */
export const interferences: Partial<Record<IonId, IonId[]>> = { K: ['NH4'] };
/** Навчальна матриця «добриво × йон», виводиться з бази добрив (не дублюється вручну). */
export const matrix: Record<string, Record<IonId, boolean>> = Object.fromEntries(
  fertilizers.map((f) => [f.id, Object.fromEntries(IONS.map((i) => [i, f.ions.includes(i)])) as Record<IonId, boolean>]),
);
