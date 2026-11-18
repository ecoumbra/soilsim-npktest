/** Спиртівка з анімованим полум’ям. lit — запалена (ковпачок знято). */
export function SpiritLamp({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 90 120" className="lamp" data-lit={lit || undefined} overflow="visible" role="img" aria-label="Спиртівка">
      <defs>
        <linearGradient id="lp-brass" x1="0" x2="1"><stop offset="0" stopColor="#7a5a22" /><stop offset=".35" stopColor="#e6c76f" /><stop offset=".7" stopColor="#b08a3a" /><stop offset="1" stopColor="#6a4e1a" /></linearGradient>
        <linearGradient id="lp-glass" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".25" stopColor="#fff" stopOpacity=".08" /><stop offset=".8" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity=".5" /></linearGradient>
        <linearGradient id="lp-fo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a14" /><stop offset=".55" stopColor="#ffb52e" /><stop offset="1" stopColor="#fff0a0" stopOpacity=".85" /></linearGradient>
        <linearGradient id="lp-fi" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#2447c8" /><stop offset="1" stopColor="#9cc8ff" /></linearGradient>
        <radialGradient id="lp-glow"><stop offset="0" stopColor="#ffb040" stopOpacity=".6" /><stop offset="1" stopColor="#ffb040" stopOpacity="0" /></radialGradient>
        <clipPath id="lp-body"><path d="M16 74C10 96 14 112 32 114H58C76 112 80 96 74 74C72 66 66 60 58 58H32C24 60 18 66 16 74Z" /></clipPath>
      </defs>
      <ellipse cx="45" cy="116" rx="38" ry="4" fill="#000" opacity=".2" />
      <path d="M16 74C10 96 14 112 32 114H58C76 112 80 96 74 74C72 66 66 60 58 58H32C24 60 18 66 16 74Z" fill="#d3e5f0" fillOpacity=".55" />
      <rect x="10" y="86" width="72" height="32" fill="#aebcff" opacity=".5" clipPath="url(#lp-body)" />
      <path d="M16 74C10 96 14 112 32 114H58C76 112 80 96 74 74C72 66 66 60 58 58H32C24 60 18 66 16 74Z" fill="url(#lp-glass)" stroke="#5d7a8c" strokeOpacity=".75" strokeWidth="1.2" />
      <path d="M22 72C18 88 20 100 28 108" stroke="#fff" strokeOpacity=".75" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="33" y="48" width="24" height="12" rx="2" fill="url(#lp-brass)" />
      <rect x="40" y="34" width="10" height="15" fill="url(#lp-brass)" />
      <rect x="43" y="26" width="4" height="9" fill="#e7dcc0" /><rect x="43" y="25" width="4" height="2" fill="#3a3028" />
      <g className="flame">
        <ellipse className="glw" cx="45" cy="8" rx="26" ry="32" fill="url(#lp-glow)" />
        <path className="fl-o" d="M45 26C34 21 33 8 45 -15C57 8 56 21 45 26Z" fill="url(#lp-fo)" opacity=".92" />
        <path className="fl-m" d="M45 26C39 22 39 12 45 -3C51 12 51 22 45 26Z" fill="#ffd45e" opacity=".9" />
        <path className="fl-i" d="M45 26C42 23.5 42 18 45 10C48 18 48 23.5 45 26Z" fill="url(#lp-fi)" />
      </g>
      <g className="cap">
        <path d="M36 49V28Q36 17 45 17Q54 17 54 28V49Z" fill="#d6e8f2" fillOpacity=".55" stroke="#5d7a8c" strokeOpacity=".75" strokeWidth="1.1" />
        <path d="M39.5 46V28Q39.5 21 43 20" stroke="#fff" strokeOpacity=".8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
