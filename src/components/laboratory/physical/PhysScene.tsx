import type { CSSProperties, ReactNode } from 'react';
import { RUN_MS, clamp01, ease, rnd, useElapsed, type SceneRuns } from './anim';

const v = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/** Кристали/гранули зразка (детермінований візерунок). form: форма частинок; pink — частка рожевих (KCl). */
const FORM: Record<string, { form: 'prill' | 'granule' | 'prism' | 'needle' | 'cube'; pink: number }> = {
  an: { form: 'granule', pink: 0 }, as: { form: 'prism', pink: 0 }, ac: { form: 'prism', pink: 0 }, kn: { form: 'needle', pink: 0 },
  kc: { form: 'cube', pink: 0.4 }, ks: { form: 'prism', pink: 0 }, ur: { form: 'prill', pink: 0 },
};
function Crystals({ id, n, w, h, k = 1, seed = 1 }: { id: string; n: number; w: number; h: number; k?: number; seed?: number }) {
  const f = FORM[id] ?? FORM.as;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = (rnd(i, seed) - 0.5) * w, y = (rnd(i, seed + 3) - 0.5) * h, r = (rnd(i, seed + 5) * 0.6 + 0.7) * k;
        const col = rnd(i, seed + 7) < f.pink ? '#eab7b2' : rnd(i, seed + 9) < 0.5 ? '#ffffff' : '#f5f4ee';
        const rot = rnd(i, seed + 11) * 180;
        const st = { stroke: '#8d968a', strokeWidth: 0.25 * k, strokeOpacity: 0.7 };
        if (f.form === 'prill') return <g key={i}><circle cx={x} cy={y} r={r * 1.25} fill={col} {...st} /><circle cx={x - r * 0.4} cy={y - r * 0.4} r={r * 0.35} fill="#fff" /></g>;
        if (f.form === 'needle') return <rect key={i} x={x - r * 1.6} y={y - r * 0.3} width={r * 3.2} height={r * 0.6} fill={col} transform={`rotate(${rot} ${x} ${y})`} {...st} />;
        if (f.form === 'cube') return <rect key={i} x={x - r} y={y - r} width={r * 2} height={r * 2} fill={col} transform={`rotate(${rot} ${x} ${y})`} {...st} />;
        if (f.form === 'granule') return <ellipse key={i} cx={x} cy={y} rx={r * 1.15} ry={r} fill={col} transform={`rotate(${rot} ${x} ${y})`} {...st} />;
        return <polygon key={i} points={`${x - r},${y} ${x},${y - r * 1.2} ${x + r},${y} ${x},${y + r * 1.2}`} fill={col} transform={`rotate(${rot} ${x} ${y})`} {...st} />;
      })}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="pg-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f5f3ec" /><stop offset="1" stopColor="#e3e0d4" /></linearGradient>
      <linearGradient id="pg-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eceae1" /><stop offset=".04" stopColor="#d1cfc3" /><stop offset="1" stopColor="#b9b7a8" /></linearGradient>
      <linearGradient id="pg-glass" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".2" stopColor="#fff" stopOpacity=".06" /><stop offset=".8" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity=".5" /></linearGradient>
      <linearGradient id="pg-metal" x1="0" x2="1"><stop offset="0" stopColor="#a4a398" /><stop offset=".35" stopColor="#f2f1eb" /><stop offset=".7" stopColor="#c2c0b4" /><stop offset="1" stopColor="#949387" /></linearGradient>
      <linearGradient id="pg-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#faf9f5" /><stop offset="1" stopColor="#d2d0c5" /></linearGradient>
      <linearGradient id="pg-water" x1="0" x2="1"><stop offset="0" stopColor="#9fcdea" /><stop offset=".5" stopColor="#bfe0f4" /><stop offset="1" stopColor="#8fc2e2" /></linearGradient>
      <linearGradient id="pg-scale" x1="0" x2="1"><stop offset="0" stopColor="#d9332e" /><stop offset=".25" stopColor="#f2a33a" /><stop offset=".5" stopColor="#e9d84a" /><stop offset=".7" stopColor="#7bc043" /><stop offset="1" stopColor="#2f9e8f" /></linearGradient>
      <radialGradient id="pg-lens"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#cfe6f5" stopOpacity=".15" /></radialGradient>
      <clipPath id="pg-bk"><path d="M168 182V244Q168 250 174 250H214Q220 250 220 244V182Z" /></clipPath>
      <clipPath id="pg-lensclip"><circle cx="0" cy="0" r="21" /></clipPath>
    </defs>
  );
}

function Jar({ no }: { no: number }) {
  return (
    <g transform="translate(8,194)">
      <ellipse cx="24" cy="57" rx="26" ry="3.5" fill="#000" opacity=".18" />
      <rect x="4" y="10" width="40" height="46" rx="6" fill="#dfe9ef" fillOpacity=".55" />
      <g transform="translate(24,44)"><Crystals id="as" n={26} w={32} h={16} k={1.1} seed={4} /></g>
      <rect x="4" y="10" width="40" height="46" rx="6" fill="url(#pg-glass)" stroke="#5d7a8c" strokeOpacity=".7" />
      <rect x="2" y="2" width="44" height="10" rx="3" fill="#233b1e" /><rect x="2" y="2" width="44" height="3" rx="1.5" fill="#fff" opacity=".25" />
      <rect x="8" y="22" width="32" height="18" rx="1.5" fill="#fbf6e6" stroke="#bfb48c" strokeWidth=".6" />
      <text x="24" y="29.5" textAnchor="middle" fontSize="5.4" fill="#5c635a">Зразок</text>
      <text x="24" y="37.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1f241f">№ {String(no).padStart(2, '0')}</text>
    </g>
  );
}

function Balance({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <g transform="translate(58,0)">
      <ellipse cx="50" cy="251" rx="54" ry="4" fill="#000" opacity=".18" />
      <rect x="0" y="226" width="100" height="24" rx="4" fill="url(#pg-body)" stroke="#949387" strokeWidth=".6" />
      <rect x="40" y="206" width="20" height="22" fill="url(#pg-metal)" />
      <ellipse cx="50" cy="206" rx="32" ry="5" fill="url(#pg-metal)" stroke="#88877b" strokeWidth=".5" />
      <rect x="12" y="231" width="52" height="14" rx="2" fill="#dcfce7" stroke="#16a34a" strokeWidth=".6" />
      <text x="62" y="242" textAnchor="end" fontFamily="ui-monospace,Menlo,Consolas,monospace" fontSize="9.5" fontWeight="700" fill="#15803d">{text}</text>
      <circle cx="76" cy="238" r="3.2" fill="#e5e9ec" stroke="#8d9aa5" strokeWidth=".6" /><circle cx="88" cy="238" r="3.2" fill="#e5e9ec" stroke="#8d9aa5" strokeWidth=".6" />
      <text x="6" y="224" fontSize="5" fill="#5c635a">AgroSim · ваги 0,01 г</text>
      {children}
    </g>
  );
}

function Boat({ id, grams, run }: { id: string; grams: number; run: boolean }) {
  return (
    <g transform="translate(108,205)">
      <g className={run ? 'ph-boat' : undefined} key={run ? 'r' : 'i'}>
        <path d="M-13 -1L13 -1L10 -7L-10 -7Z" fill="#faf9f5" stroke="#949387" strokeWidth=".6" />
        <path d="M-13 -1L13 -1L12 0.8L-12 0.8Z" fill="#d2d0c5" />
        {run && (
          <g className="ph-boatx" style={v({ '--g': 0.45 + grams / 15 })}>
            <g transform="translate(0,-9)"><Crystals id={id} n={Math.round(8 + grams * 2)} w={16} h={4} k={0.8} seed={2} /></g>
          </g>
        )}
      </g>
    </g>
  );
}

function Spatula({ run }: { run: boolean }) {
  return run ? (
    <g transform="translate(34,203)"><g className="ph-spat">
      <path d="M0 0L-20 -14" stroke="#949387" strokeWidth="2.2" strokeLinecap="round" /><ellipse cx="3" cy="1.2" rx="6.5" ry="2.1" fill="url(#pg-metal)" stroke="#88877b" strokeWidth=".4" />
      <g transform="translate(3,-1)"><Crystals id="as" n={5} w={8} h={1.5} k={0.8} seed={9} /></g>
    </g></g>
  ) : null;
}

function Beaker({ id, run }: { id: string; run: SceneRuns['sol'] }) {
  const sol = run && run.kind === 'sol' ? run : null;
  const N = sol ? Math.round(8 + sol.grams * 1.8) : 0;
  const resFrac = sol ? Math.max(0, (sol.grams - sol.s10) / sol.grams) : 0;
  const keep = Math.round(N * resFrac);
  return (
    <g>
      <ellipse cx="194" cy="251" rx="30" ry="3.5" fill="#000" opacity=".18" />
      <path d="M168 182V244Q168 250 174 250H214Q220 250 220 244V182Z" fill="#dfe9ef" fillOpacity=".4" />
      <g clipPath="url(#pg-bk)">
        <rect x="166" y="228" width="56" height="24" fill="url(#pg-water)" opacity=".8" />
        <ellipse cx="194" cy="228" rx="26" ry="2" fill="#fff" opacity=".4" />
        {sol && <rect key={`c${sol.key}`} className={`ph-cloud ${sol.dissolves ? 'dis' : 'res'}`} x="166" y="228" width="56" height="24" fill="#fff" />}
      </g>
      {sol && Array.from({ length: N }, (_, i) => {
        const x = 175 + rnd(i, 21) * 38, yEnd = 244 - rnd(i, 22) * 4, dy = yEnd - 168;
        return (
          <g key={`${sol.key}-${i}`} transform={`translate(${x},168)`}>
            <g className="ph-fall" style={v({ '--dy': `${dy}px`, '--fd': `${(3.5 + i * 0.04).toFixed(2)}s` })}>
              <g className={i >= keep ? 'ph-dis' : undefined} style={v({ '--dd': `${(5.0 + rnd(i, 23) * 1.4).toFixed(2)}s` })}>
                <Crystals id={id} n={1} w={0} h={0} k={2.2} seed={i + 30} />
              </g>
            </g>
          </g>
        );
      })}
      {sol && (
        <g transform="translate(194,176)" key={`rod${sol.key}`}>
          <g className="ph-rod"><rect x="-1" y="-6" width="2" height="68" rx="1" fill="#e6eef3" stroke="#6d8798" strokeWidth=".5" /><rect x="-1" y="58" width="2" height="4" rx="1" fill="#cbd8e0" /></g>
        </g>
      )}
      <path d="M168 182V244Q168 250 174 250H214Q220 250 220 244V182Z" fill="url(#pg-glass)" stroke="#5d7a8c" strokeOpacity=".8" strokeWidth="1.2" />
      <path d="M166 181L170 183M222 181L218 183" stroke="#5d7a8c" strokeWidth="1.2" strokeLinecap="round" />
      {[236, 228, 220, 212, 204].map((y, i) => <line key={y} x1="168" x2={i % 2 ? 173 : 177} y1={y} y2={y} stroke="#4d6b7c" strokeWidth=".6" />)}
      <text x="180" y="230" fontSize="4.6" fill="#35566b">10 мл</text>
      <path d="M172 188V240" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(228,0)"><rect x="-1.5" y="172" width="3" height="78" rx="1.5" fill="#f1f6f9" stroke="#6d8798" strokeWidth=".5" /><rect x="-.7" y="206" width="1.4" height="42" fill="#d8332e" /><circle cx="0" cy="248" r="2.6" fill="#d8332e" /><text x="4" y="204" fontSize="5.2" fontWeight="700" fill="#b02a26">20 °C</text></g>
    </g>
  );
}

function PhStation({ run }: { run: SceneRuns['ph'] }) {
  const ph = run && run.kind === 'ph' ? run : null;
  return (
    <g>
      <rect x="226" y="136" width="46" height="34" rx="2" fill="#fffdf5" stroke="#b9b08a" strokeWidth=".7" />
      <text x="249" y="143" textAnchor="middle" fontSize="5.2" fontWeight="700" fill="#4b5563">шкала pH</text>
      <rect x="230" y="147" width="38" height="8" rx="1" fill="url(#pg-scale)" />
      {[4, 5, 6, 7, 8].map((n, i) => <text key={n} x={231 + i * 9.1} y="164" fontSize="5.4" fill="#374151" textAnchor="middle">{n}</text>)}
      <ellipse cx="249" cy="251" rx="14" ry="3" fill="#000" opacity=".18" />
      <path d="M243 196V244Q243 250 249 250Q255 250 255 244V196Z" fill="#dfe9ef" fillOpacity=".45" />
      <path d="M243.6 226H254.4V244Q254.4 249.4 249 249.4Q243.6 249.4 243.6 244Z" fill="url(#pg-water)" opacity=".85" />
      {ph && (
        <g transform="translate(249,166)" key={`p${ph.key}`}>
          <g className="ph-dip"><rect x="-2.6" y="0" width="5.2" height="40" rx=".8" className="ph-paper" style={v({ '--c': ph.acidic ? '#f2a33a' : '#7bc043' })} /></g>
        </g>
      )}
      <path d="M243 196V244Q243 250 249 250Q255 250 255 244V196" fill="none" stroke="#5d7a8c" strokeOpacity=".8" strokeWidth="1.1" />
      <path d="M245.5 200V240" stroke="#fff" strokeOpacity=".8" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="249" cy="196" rx="6" ry="1.4" fill="#fff" fillOpacity=".3" stroke="#5d7a8c" strokeWidth=".8" />
      <text x="249" y="260" textAnchor="middle" fontSize="5" fill="#5c635a">1 % розчин</text>
    </g>
  );
}

function Chamber({ id, run, e }: { id: string; run: SceneRuns['rh']; e: number }) {
  const r = run && run.kind === 'rh' ? run : null;
  const rh = !r ? 45 : e < 800 ? 45 : e < 2800 ? 45 + (r.rh - 45) * ease((e - 800) / 2000) : r.rh;
  const hours = r ? 24 * clamp01((e - 3000) / 3200) : 0;
  return (
    <g>
      <ellipse cx="335" cy="252" rx="60" ry="4" fill="#000" opacity=".18" />
      <path d="M282 218V244Q282 250 290 250H380Q388 250 388 244V218Z" fill="#dfe9ef" fillOpacity=".4" />
      <rect x="283" y="241" width="104" height="8" rx="3" fill="#faf9f5" opacity=".85" />
      <rect x="296" y="236" width="78" height="2.2" fill="#949387" /><ellipse cx="335" cy="229" rx="26" ry="3.2" fill="url(#pg-glass)" stroke="#5d7a8c" strokeWidth=".7" />
      <g transform="translate(335,226)">
        <ellipse cx="0" cy="0" rx="17" ry="2.4" fill="#eef3f6" stroke="#7f8b95" strokeWidth=".5" />
        <g key={r ? r.key : 'i'}>
          <g className={r?.absorbs ? 'ph-xt' : undefined}><g transform="translate(0,-1.2)"><Crystals id={id} n={26} w={26} h={3} k={0.8} seed={6} /></g></g>
          {r?.absorbs && (
            <g className="ph-wet">
              <ellipse cx="0" cy="-.6" rx="14" ry="2.4" fill="#cfe6f4" stroke="#7aa9c4" strokeWidth=".5" opacity=".95" />
              <ellipse cx="-4" cy="-1.6" rx="5" ry="0.8" fill="#fff" opacity=".85" />
              {[-9, -3, 4, 10].map((x, i) => <circle key={x} cx={x} cy={-2.4 - (i % 2)} r="1.1" fill="#e9f5fd" stroke="#7aa9c4" strokeWidth=".3" />)}
            </g>
          )}
        </g>
      </g>
      <path d="M282 218V244Q282 250 290 250H380Q388 250 388 244V218" fill="none" stroke="#5d7a8c" strokeOpacity=".8" strokeWidth="1.2" />
      <path d="M287 222V242" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
      <g key={r ? `l${r.key}` : 'li'}>
        <g className={r ? 'ph-lid' : undefined} style={{ transform: r ? undefined : 'translateY(-16px)' }}>
          <path d="M280 218H390Q388 197 335 192Q282 197 280 218Z" fill="#cfe3ee" fillOpacity=".55" stroke="#5d7a8c" strokeWidth="1.2" />
          <circle cx="335" cy="191" r="3.6" fill="#7f8b95" /><path d="M292 211Q300 200 318 197" stroke="#fff" strokeOpacity=".8" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </g>
      <rect x="296" y="232" width="78" height="16" rx="2.4" fill="#1f241f" stroke="#0d110d" strokeWidth=".6" />
      <text x="302" y="241" fontFamily="ui-monospace,Menlo,Consolas,monospace" fontSize="7.6" fontWeight="700" fill="#4ade80">RH {String(Math.round(rh)).padStart(2, ' ')} %</text>
      <text x="302" y="246.6" fontFamily="ui-monospace,Menlo,Consolas,monospace" fontSize="4.8" fill="#86efac">30 °C · t = {Math.round(hours)} год</text>
      <rect x="352" y="236" width="18" height="2.4" rx="1.2" fill="#363b34" /><rect x="352" y="236" width={18 * clamp01((rh - 40) / 60)} height="2.4" rx="1.2" fill="#4ade80" />
      <text x="335" y="269" textAnchor="middle" fontSize="5" fill="#5c635a">камера вологості</text>
    </g>
  );
}

function Magnifier({ id, run }: { id: string; run: SceneRuns['look'] }) {
  return (
    <g>
      <ellipse cx="104" cy="277" rx="40" ry="9" fill="#000" opacity=".12" />
      <ellipse cx="104" cy="274" rx="38" ry="8.5" fill="#eef4f8" fillOpacity=".7" stroke="#5d7a8c" strokeOpacity=".7" strokeWidth="1" />
      <g transform="translate(104,274)"><g transform="scale(1,.42)"><Crystals id={id} n={48} w={56} h={30} k={1.1} seed={13} /></g></g>
      <ellipse cx="104" cy="274" rx="38" ry="8.5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
      <text x="104" y="291" textAnchor="middle" fontSize="5" fill="#5c635a">чашка Петрі · лупа</text>
      <g transform="translate(104,262)" key={run ? run.key : 'rest'}>
        <g className={run ? 'ph-lens' : undefined} style={{ transform: run ? undefined : 'translate(70px,4px)' }}>
          <g clipPath="url(#pg-lensclip)"><circle r="21" fill="#faf9f5" /><g transform="scale(2.1,1.4)"><Crystals id={id} n={18} w={22} h={14} k={1.6} seed={13} /></g></g>
          <circle r="21" fill="url(#pg-lens)" stroke="#6b7782" strokeWidth="2.6" /><circle r="23.4" fill="none" stroke="#a9b3bb" strokeWidth=".8" />
          <path d="M-12 -10Q-6 -16 2 -17" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".9" />
          <path d="M15 15L34 33" stroke="#3b2f2a" strokeWidth="5.6" strokeLinecap="round" /><path d="M15 15L21 21" stroke="#9aa5ae" strokeWidth="5.8" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** Сцена фізичної лабораторії: ваги, хімстакан, pH-станція, камера вологості, лупа. */
export function PhysScene({ sample, no, runs }: { sample: string; no: number; runs: SceneRuns }) {
  const sol = runs.sol && runs.sol.kind === 'sol' ? runs.sol : null;
  const eSol = useElapsed(sol?.key ?? 0, RUN_MS.sol);
  const eRh = useElapsed(runs.rh?.key ?? 0, RUN_MS.rh);
  const mass = !sol ? 0 : eSol < 1600 ? sol.grams * ease(eSol / 1600) : eSol < 2100 ? sol.grams : 0;
  return (
    <svg viewBox="0 56 400 244" className="phys-scene" role="img" aria-label="Лабораторія фізичних властивостей" overflow="hidden">
      <Defs />
      <rect y="56" width="400" height="136" fill="url(#pg-wall)" /><rect y="192" width="400" height="108" fill="url(#pg-table)" /><rect y="192" width="400" height="2.5" fill="#fff" opacity=".85" />
      <g stroke="#fff" strokeOpacity=".55" strokeWidth=".8">{Array.from({ length: 8 }, (_, i) => <line key={`a${i}`} x1={i * 50 + 25} x2={i * 50 + 25} y1="56" y2="192" />)}{Array.from({ length: 3 }, (_, i) => <line key={`b${i}`} x1="0" x2="400" y1={i * 48 + 72} y2={i * 48 + 72} />)}</g>
      <rect x="10" y="64" width="380" height="20" rx="5" fill="url(#pg-metal)" opacity=".92" />
      <circle cx="24" cy="74" r="3.4" fill="#22c55e" /><text x="34" y="77.4" fontSize="9" fontWeight="700" fill="#233b1e">AgroSim · фізичні властивості добрив</text><text x="378" y="77.4" textAnchor="end" fontSize="8" fill="#363b34">🥽 окуляри обов’язкові</text>
      <Jar no={no} />
      <Balance text={`${mass.toFixed(2).padStart(5, ' ')} g`} />
      <Boat id={sample} grams={sol?.grams ?? 0} run={!!sol} key={sol ? `b${sol.key}` : 'b0'} />
      <Spatula run={!!sol} key={sol ? `s${sol.key}` : 's0'} />
      <Beaker id={sample} run={runs.sol} />
      <PhStation run={runs.ph} />
      <Chamber id={sample} run={runs.rh} e={eRh} />
      <Magnifier id={sample} run={runs.look} />
    </svg>
  );
}