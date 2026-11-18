import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { TubeState } from '../../types';
import { tubeTint } from './visuals';

const rnd = (i: number, s: number) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const BOTTOM = 186, BASE = 106, ACID = 36;

function Paper({ blue, still }: { blue: boolean; still: boolean }) {
  const [on, setOn] = useState(still);
  useEffect(() => {
    if (still || !blue) return;
    const id = window.setTimeout(() => setOn(true), 40);
    return () => window.clearTimeout(id);
  }, [blue, still]);
  return (
    <g transform="translate(45 -4) rotate(12)">
      <rect className="paper" x="0" y="0" width="8" height="42" rx="1" style={{ fill: blue && on ? '#3563c9' : '#d23b3b' }} />
      <rect x="0" y="24" width="8" height="18" rx="1" fill="#0b2a55" opacity=".18" />
      <rect x="1" y="2" width="1.6" height="36" fill="#fff" opacity=".25" />
    </g>
  );
}

interface Props { tube: TubeState; delay?: number; heating?: boolean; still?: boolean }

export function TestTube({ tube, delay = 0.8, heating = false, still = false }: Props) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const n = Math.min(tube.reagents.length, 3);
  const layered = tube.reagents.includes('H2SO4');
  const top = BASE - 14 * n;
  const iface = BOTTOM - ACID;
  const tint = [...tube.reagents].reverse().map((r) => tubeTint[r]).find(Boolean) ?? '#a9d3ec';
  const ppt = tube.precipitate;
  const style = { '--d': `${delay}s` } as CSSProperties;
  const v = (o: Record<string, string>) => o as unknown as CSSProperties;
  return (
    <svg viewBox="0 0 80 220" className="tube" style={style} data-still={still || undefined} role="img" aria-label="Пробірка" overflow="visible">
      <defs>
        <clipPath id={`${u}c`}><path d="M24.5 10V170a15.5 15.5 0 0 0 31 0V10Z" /></clipPath>
        <linearGradient id={`${u}g`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset=".2" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".55" stopColor="#9fb7c6" stopOpacity=".06" /><stop offset=".85" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`${u}s`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".16" /><stop offset=".25" stopColor="#000" stopOpacity="0" />
          <stop offset=".8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id={`${u}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3a1c" stopOpacity="0" /><stop offset=".45" stopColor="#6b3a1c" stopOpacity=".95" />
          <stop offset=".6" stopColor="#4a2610" stopOpacity="1" /><stop offset="1" stopColor="#6b3a1c" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${u}h`}><stop offset="0" stopColor="#ff9a3c" stopOpacity=".75" /><stop offset="1" stopColor="#ff9a3c" stopOpacity="0" /></radialGradient>
        <filter id={`${u}b`}><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <g key={tube.replay}>
        {tube.filled && (
          <g clipPath={`url(#${u}c)`} className={tube.filled ? 'liq' : ''}>
            <rect x="24" y={top} width="32" height={200 - top} fill={tint} opacity=".8" />
            {layered && <rect x="24" y={iface} width="32" height="60" fill="#e9dfb8" opacity=".75" />}
            <rect x="24" y={top} width="32" height={200 - top} fill={`url(#${u}s)`} />
            <ellipse cx="40" cy={top} rx="15.5" ry="2.3" fill="#fff" opacity=".38" />
            <path d={`M24.5 ${top}Q40 ${top + 4} 55.5 ${top}`} fill="none" stroke="#6a8aa0" strokeOpacity=".5" strokeWidth=".7" />
            {layered && <line x1="24" x2="56" y1={iface} y2={iface} stroke="#a89a60" strokeOpacity=".5" strokeWidth=".6" />}
            {tube.ring && (
              <g className="ringg" style={{ transformOrigin: `40px ${iface}px` }}>
                <rect x="24" y={iface - 9} width="32" height="18" fill={`url(#${u}r)`} />
              </g>
            )}
            {ppt && (
              <g className={`ppt${tube.dissolved ? ' dis' : ''}`}>
                <rect className="turb" x="24" y={top} width="32" height={BOTTOM - top} fill={ppt} />
                {!still && Array.from({ length: 26 }, (_, i) => {
                  const y0 = top + 4 + rnd(i, 1) * (BOTTOM - top - 14);
                  return (
                    <circle key={i} className="pt" cx={27 + rnd(i, 2) * 26} cy={y0} r={1 + rnd(i, 3) * 1.3} fill={ppt} stroke="#475569" strokeOpacity=".45" strokeWidth=".35"
                      style={v({ '--dy': `${172 - y0}px`, '--t': `${2.4 + rnd(i, 4) * 1.6}s`, '--w': `calc(var(--d) + ${(rnd(i, 5) * 0.7).toFixed(2)}s)` })} />
                  );
                })}
                <g className="sed">
                  <rect x="24" y="173" width="32" height="18" fill={ppt} />
                  <rect x="24" y="182" width="32" height="9" fill="#334155" opacity=".18" />
                  <ellipse cx="40" cy="173" rx="15.5" ry="3.4" fill={ppt} stroke="#475569" strokeOpacity=".7" strokeWidth=".7" />
                </g>
              </g>
            )}
            {tube.gas && !still && Array.from({ length: 14 }, (_, i) => (
              <circle key={i} className="bub" cx={28 + rnd(i, 6) * 24} cy="178" r={0.8 + rnd(i, 7) * 1.7}
                style={v({ '--rise': `${178 - top - 3}px`, '--t': `${1.8 + rnd(i, 8) * 1.6}s`, '--w': `calc(var(--d) + ${(rnd(i, 9) * 1.5).toFixed(2)}s)` })} />
            ))}
            {heating && Array.from({ length: 8 }, (_, i) => (
              <circle key={i} className="bub small" cx={29 + rnd(i, 11) * 22} cy="180" r={0.6 + rnd(i, 12) * 0.5}
                style={v({ '--rise': `${180 - top - 3}px`, '--t': `${1.4 + rnd(i, 13)}s`, '--w': `${(rnd(i, 14) * 1.2).toFixed(2)}s` })} />
            ))}
          </g>
        )}
        {tube.gas && !still && [0, 1, 2].map((i) => (
          <path key={i} className="vap" d="M40 6c-5-8 5-13 0-22" filter={`url(#${u}b)`} style={v({ '--w': `calc(var(--d) + ${i * 0.7}s)`, '--x': `${(i - 1) * 6}px` })} />
        ))}
      </g>
      <ellipse cx="40" cy="182" rx="20" ry="11" fill={`url(#${u}h)`} className="heatglow" style={{ opacity: heating ? 1 : 0 }} />
      <path d="M22.5 10V170a17.5 17.5 0 0 0 35 0V10Z" fill={`url(#${u}g)`} />
      <path d="M22.5 10V170a17.5 17.5 0 0 0 35 0V10" fill="none" stroke="#5d7a8c" strokeOpacity=".8" strokeWidth="1.4" />
      <path d="M24.5 10V170a15.5 15.5 0 0 0 31 0V10" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth=".8" />
      <path d="M28.5 16V158" stroke="#fff" strokeOpacity=".8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M52 22V120" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M30 178q4 5 9 6" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="40" cy="10" rx="18" ry="3" fill="#fff" fillOpacity=".2" stroke="#5d7a8c" strokeOpacity=".85" strokeWidth="1.4" />
      {tube.paper !== 'none' && <g key={`p${tube.replay}`}><Paper blue={tube.paper === 'blue'} still={still} /></g>}
    </svg>
  );
}
