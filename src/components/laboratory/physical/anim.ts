import { useEffect, useState } from 'react';

/** Скільки мс минуло з моменту key (0 — не запущено), не більше total. Використовується для цифрових табло. */
export function useElapsed(key: number, total: number): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!key) { setT(0); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const e = now - t0;
      setT(Math.min(e, total));
      if (e < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, total]);
  return t;
}
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
export const rnd = (i: number, s: number) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

export type Run =
  | { kind: 'look'; key: number }
  | { kind: 'sol'; key: number; grams: number; dissolves: boolean; s10: number }
  | { kind: 'rh'; key: number; rh: number; absorbs: boolean }
  | { kind: 'ph'; key: number; acidic: boolean };
export interface SceneRuns { look?: Run; sol?: Run; rh?: Run; ph?: Run }
/** Тривалість анімації кожного досліду, мс. */
export const RUN_MS = { look: 4600, sol: 8000, rh: 7200, ph: 5200 } as const;
