/** Штатив для пробірок. part="back" — каркас і верхня дошка; part="front" — передня грань (малюється поверх пробірок). */
export function Rack({ part }: { part: 'back' | 'front' }) {
  return (
    <svg viewBox="0 0 300 130" className={`rack ${part}`} aria-hidden="true">
      <defs>
        <linearGradient id="rk-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d6a96c" /><stop offset=".5" stopColor="#c08f52" /><stop offset="1" stopColor="#9a6c38" /></linearGradient>
        <linearGradient id="rk-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2b97f" /><stop offset="1" stopColor="#cfa064" /></linearGradient>
        <linearGradient id="rk-l" x1="0" x2="1"><stop offset="0" stopColor="#a87a42" /><stop offset=".5" stopColor="#c8975a" /><stop offset="1" stopColor="#8a5f30" /></linearGradient>
      </defs>
      {part === 'back' ? (
        <g>
          <ellipse cx="150" cy="124" rx="146" ry="5" fill="#000" opacity=".18" />
          <path d="M10 38H26L30 122H14Z" fill="url(#rk-l)" /><path d="M274 38H290L286 122H270Z" fill="url(#rk-l)" />
          <rect x="10" y="108" width="280" height="14" rx="2" fill="url(#rk-w)" />
          <rect x="10" y="108" width="280" height="2.4" fill="#fff" opacity=".25" />
          <path d="M10 38L22 22H278L290 38Z" fill="url(#rk-t)" />
          {[75, 150, 225].map((x) => (
            <g key={x}><ellipse cx={x} cy="30" rx="16" ry="5" fill="#5a3a1a" /><ellipse cx={x} cy="29" rx="14" ry="3.6" fill="#2b1a0a" /></g>
          ))}
        </g>
      ) : (
        <g>
          <rect x="10" y="38" width="280" height="14" rx="2" fill="url(#rk-w)" />
          <rect x="10" y="38" width="280" height="2.4" fill="#fff" opacity=".35" />
          <rect x="10" y="50" width="280" height="2" fill="#000" opacity=".18" />
        </g>
      )}
    </svg>
  );
}
