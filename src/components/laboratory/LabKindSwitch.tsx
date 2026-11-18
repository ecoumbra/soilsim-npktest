import type { Dict } from '../../i18n';

export type LabKind = 'chem' | 'phys';

/** Перемикач типу лабораторії: якісні реакції / фізичні властивості. */
export function LabKindSwitch({ t, kind, onChange }: { t: Dict; kind: LabKind; onChange: (k: LabKind) => void }) {
  return (
    <div role="group" aria-label="Тип лабораторії" className="seg seg-bar" style={{ marginBottom: 16 }}>
      <button aria-pressed={kind === 'chem'} onClick={() => onChange('chem')}>
        <span aria-hidden="true">⚗️</span> <span>{t.labChem}</span>
      </button>
      <button aria-pressed={kind === 'phys'} onClick={() => onChange('phys')}>
        <span aria-hidden="true">⚖️</span> <span>{t.labPhys}</span>
      </button>
    </div>
  );
}