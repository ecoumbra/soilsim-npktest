import type { CSSProperties } from 'react';

/**
 * Піпетка: опускається вертикально над пробіркою й скидає 3 краплі.
 * Краплі — окремий шар, що не рухається разом із піпеткою: їх траєкторія завжди проходить
 * через центр пробірки (left: 46%) і закінчується на поверхні рідини (fall, у одиницях viewBox).
 */
export function Dropper({ color, fall }: { color: string; fall: number }) {
  return (
    <>
      <div className="s-dropper" aria-hidden="true">
        <svg viewBox="0 0 30 100" overflow="visible">
          <path className="bulb" d="M9 22Q6 2 15 1Q24 2 21 22Z" fill="#1f2730" />
          <path d="M11 20Q10 8 13 5" stroke="#fff" strokeOpacity=".3" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <rect x="7" y="21" width="16" height="6" rx="2" fill="#3b4752" />
          <path d="M11 27H19L17.6 92L15 99L12.4 92Z" fill="#e6f1f7" fillOpacity=".7" stroke="#5d7a8c" strokeOpacity=".7" strokeWidth=".8" />
          <path d="M12.2 62H17.8L17.6 92L15 99L12.4 92Z" fill={color} />
          <path d="M13 30V80" stroke="#fff" strokeOpacity=".8" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
      <div className="s-drops" aria-hidden="true" style={{ '--fall': `${fall}px` } as CSSProperties}>
        <svg viewBox="0 0 30 100" overflow="visible">
          {[0, 1, 2].map((i) => (
            <ellipse key={i} className="dr" cx="15" cy="100" rx="1.9" ry="2.5" fill={color} stroke="#4a6a80" strokeOpacity=".6" strokeWidth=".5"
              style={{ animationDelay: `${0.55 + i * 0.2}s` }} />
          ))}
        </svg>
      </div>
    </>
  );
}
