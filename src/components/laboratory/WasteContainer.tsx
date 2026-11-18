/** Ємність для відходів. receiving — рідину зливають (анімація крапель). */
export function WasteContainer({ receiving }: { receiving: boolean }) {
  return (
    <svg viewBox="0 0 80 100" className="waste" overflow="visible" role="img" aria-label="Ємність для відходів">
      <defs>
        <linearGradient id="ws-body" x1="0" x2="1"><stop offset="0" stopColor="#f6c21a" /><stop offset=".3" stopColor="#ffd84d" /><stop offset=".75" stopColor="#e0a500" /><stop offset="1" stopColor="#b98200" /></linearGradient>
      </defs>
      <ellipse cx="40" cy="96" rx="32" ry="4" fill="#000" opacity=".2" />
      <rect x="10" y="30" width="60" height="64" rx="7" fill="url(#ws-body)" />
      <rect x="8" y="24" width="64" height="9" rx="3" fill="#2b3640" />
      <ellipse cx="40" cy="24" rx="17" ry="3.4" fill="#0f151b" />
      <ellipse cx="40" cy="24" rx="13" ry="2" fill="#000" />
      <path d="M17 38V86" stroke="#fff" strokeOpacity=".5" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="17" y="50" width="46" height="34" rx="2" fill="#fff" stroke="#c9d1d8" strokeWidth=".8" />
      <path d="M40 53L50 69H30Z" fill="#fff" stroke="#dc2626" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="39.1" y="58" width="1.8" height="6" fill="#dc2626" /><circle cx="40" cy="66.6" r="1.1" fill="#dc2626" />
      <text x="40" y="79.5" textAnchor="middle" fontSize="7.2" fontWeight="700" fill="#1e293b">ВІДХОДИ</text>
      {receiving && [0, 1, 2, 3].map((i) => (
        <ellipse key={i} className="wdrop" cx={38 + i * 1.6} cy="4" rx="1.8" ry="2.4" fill="#bcdcf0" stroke="#4a6a80" strokeOpacity=".5" strokeWidth=".5" style={{ animationDelay: `${0.75 + i * 0.18}s` }} />
      ))}
    </svg>
  );
}
