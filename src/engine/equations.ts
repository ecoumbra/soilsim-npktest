/** Перевірка балансу атомів і зарядів рівнянь та форматування формул. */
type Atoms = Record<string, number>;
interface Species { coef: number; formula: string; charge: number }

export function atoms(formula: string): Atoms {
  let i = 0;
  const num = (): number => {
    const m = /^\d+/.exec(formula.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  const parse = (): Atoms => {
    const out: Atoms = {};
    while (i < formula.length) {
      const ch = formula[i];
      if (ch === '(') {
        i++;
        const inner = parse();
        const n = num();
        for (const k of Object.keys(inner)) out[k] = (out[k] ?? 0) + inner[k] * n;
      } else if (ch === ')') {
        i++;
        return out;
      } else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
        if (!m) throw new Error(`Некоректна формула: ${formula}`);
        i += m[0].length;
        out[m[0]] = (out[m[0]] ?? 0) + num();
      }
    }
    return out;
  };
  return parse();
}

function parseSide(side: string): Species[] {
  return side.split(' + ').map((sp) => {
    const m = /^(\d*)(.+?)(?:\^(\d*)([+-]))?$/.exec(sp.trim());
    if (!m) throw new Error(`Некоректна частинка: ${sp}`);
    const charge = m[4] ? (m[3] ? Number(m[3]) : 1) * (m[4] === '+' ? 1 : -1) : 0;
    return { coef: m[1] ? Number(m[1]) : 1, formula: m[2], charge };
  });
}

function total(side: Species[]): { atoms: Atoms; charge: number } {
  const a: Atoms = {};
  let charge = 0;
  for (const s of side) {
    for (const [el, n] of Object.entries(atoms(s.formula))) a[el] = (a[el] ?? 0) + n * s.coef;
    charge += s.charge * s.coef;
  }
  return { atoms: a, charge };
}

export function isBalanced(equation: string): boolean {
  const [l, r] = equation.split('->');
  const L = total(parseSide(l));
  const R = total(parseSide(r));
  const els = new Set([...Object.keys(L.atoms), ...Object.keys(R.atoms)]);
  return L.charge === R.charge && [...els].every((e) => (L.atoms[e] ?? 0) === (R.atoms[e] ?? 0));
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };

/** "PO4^3- + 3NH4^+ -> ..." → "PO₄³⁻ + 3NH₄⁺ → ..." */
export function pretty(eq: string): string {
  return eq
    .replace(/\^(\d*[+-])/g, (_m, c: string) => [...c].map((x) => SUP[x] ?? x).join(''))
    .replace(/([A-Za-z)])(\d+)/g, (_m, a: string, d: string) => a + [...d].map((x) => SUB[Number(x)]).join(''))
    .replace(/->/g, '→');
}
