import type { ReagentId, Hazard } from '../../types';
import { bottles } from './visuals';

interface Props { id: ReagentId; label: string; hazard: Hazard; note: string; disabled: boolean; hl: boolean; onClick: () => void }

export function ReagentBottle({ id, label, hazard, note, disabled, hl, onClick }: Props) {
  const b = bottles[id];
  const amber = b.glass === 'amber';
  const u = `bt${id}`;
  const body = 'M12 40Q12 33 19 33H45Q52 33 52 40V86Q52 92 46 92H18Q12 92 12 86Z';
  return (
    <button type="button" className={`bottle${hl ? ' hl' : ''}`} disabled={disabled} onClick={onClick}
      title={`${label}${note ? ` — ${note}` : ''}`} aria-label={`${label}${note ? `. ${note}` : ''}`}>
      <svg viewBox="0 0 64 96" aria-hidden="true">
        <defs>
          <clipPath id={`${u}c`}><path d={body} /></clipPath>
          <linearGradient id={`${u}g`} x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".2" stopColor="#fff" stopOpacity=".05" />
            <stop offset=".8" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#fff" stopOpacity=".45" />
          </linearGradient>
          <linearGradient id={`${u}a`} x1="0" x2="1"><stop offset="0" stopColor="#9a5612" /><stop offset=".4" stopColor="#c9822c" /><stop offset="1" stopColor="#6b3a0a" /></linearGradient>
        </defs>
        <ellipse cx="32" cy="93" rx="22" ry="2.6" fill="#000" opacity=".16" />
        <path d={body} fill={amber ? `url(#${u}a)` : '#d8e8f1'} fillOpacity={amber ? 0.95 : 0.55} />
        {!amber && <rect x="12" y="52" width="40" height="42" fill={b.liquid} opacity=".85" clipPath={`url(#${u}c)`} />}
        <rect x="26" y="22" width="12" height="12" fill={amber ? '#8a4d10' : '#d8e8f1'} fillOpacity={amber ? 1 : 0.6} stroke="#5d7a8c" strokeOpacity=".6" strokeWidth=".8" />
        {b.kind === 'dropper' ? (
          <g>
            <rect x="24" y="19" width="16" height="6" rx="1.5" fill="#3b4752" />
            <path d="M27 20Q26 4 32 3Q38 4 37 20Z" fill="#1f2730" />
            <path d="M29 18Q29 7 31 5" stroke="#fff" strokeOpacity=".3" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d="M25 22L27 10H37L39 22Z" fill="#cfe2ee" fillOpacity=".8" stroke="#5d7a8c" strokeOpacity=".7" strokeWidth=".8" />
            <rect x="29" y="6" width="6" height="5" rx="1" fill="#cfe2ee" stroke="#5d7a8c" strokeOpacity=".7" strokeWidth=".8" />
          </g>
        )}
        <path d={body} fill={`url(#${u}g)`} stroke="#5d7a8c" strokeOpacity=".7" strokeWidth="1" />
        <path d="M16 42V84" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
        <rect x="15" y="54" width="34" height="26" rx="1.5" fill="#fbf6e6" stroke="#bfb48c" strokeWidth=".7" />
        <text x="32" y="66" textAnchor="middle" fontSize={b.fs} fontWeight="700" fill="#1e293b">{b.short}</text>
        <text x="32" y="75.5" textAnchor="middle" fontSize="5.4" fill="#64748b">{b.sub}</text>
        {hazard !== 'low' && (
          <g transform="translate(44 49) rotate(45)">
            <rect x="-4.5" y="-4.5" width="9" height="9" fill="#fff" stroke={hazard === 'high' ? '#dc2626' : '#f59e0b'} strokeWidth="1.6" />
            <rect x="-.6" y="-2.6" width="1.2" height="3.4" fill={hazard === 'high' ? '#dc2626' : '#d97706'} transform="rotate(-45)" />
            <circle cx="0" cy="2.2" r=".7" fill={hazard === 'high' ? '#dc2626' : '#d97706'} transform="rotate(-45)" />
          </g>
        )}
      </svg>
      <span>{b.short}</span>
    </button>
  );
}
