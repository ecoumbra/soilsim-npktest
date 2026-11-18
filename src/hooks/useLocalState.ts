import { useEffect, useState } from 'react';

const PREFIX = 'agrosim.v1.';
/** Читання зі сховища браузера з перевіркою; будь-яка помилка (приватний режим, пошкоджені дані) → fallback. */
export function readStored<T>(key: string, fallback: T, valid?: (v: unknown) => boolean): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const v = JSON.parse(raw) as unknown;
    return valid && !valid(v) ? fallback : (v as T);
  } catch { return fallback; }
}
/** useState, що зберігається в localStorage (прогрес студента переживає оновлення сторінки). */
export function useLocalState<T>(key: string, init: T | (() => T), valid?: (v: unknown) => boolean) {
  const [v, setV] = useState<T>(() => readStored(key, typeof init === 'function' ? (init as () => T)() : init, valid));
  useEffect(() => { try { window.localStorage.setItem(PREFIX + key, JSON.stringify(v)); } catch { /* сховище недоступне */ } }, [key, v]);
  return [v, setV] as const;
}
export function clearStored(): void {
  try { Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => window.localStorage.removeItem(k)); } catch { /* ignore */ }
}
export const isArray = (v: unknown): boolean => Array.isArray(v);
export const isPositiveInt = (v: unknown): boolean => typeof v === 'number' && Number.isInteger(v) && v > 0;
