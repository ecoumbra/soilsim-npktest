import { useState } from 'react';
import { Activity, BookMarked, FileSpreadsheet, Layers } from 'lucide-react';
import type { Dict } from '../../i18n';
import { fertilizers } from '../../data/fertilizers';
import { physical } from '../../data/physicalProperties';
import { reactions } from '../../data/reactions';
import { references } from '../../data/references';
import { pretty } from '../../engine/equations';

type Section = 'basics' | 'cards' | 'phys' | 'refs';
const fmt = (n: number | null) => (n === null ? '—' : String(n).replace('.', ','));
const STATUS = { todo: 'потребує вказання', secondary: 'вторинне джерело', verified: 'перевірено' } as const;

// TODO(en): теоретичні тексти поки що лише українською.
function Basics({ onOpenLab }: { onOpenLab: () => void }) {
  const signs: { icon: string; title: string; text: string; eq?: string }[] = [
    { icon: '⚪', title: 'Утворення осаду', text: 'Йон виявляють за нерозчинною сіллю: BaSO₄ (білий), AgCl (білий сирнистий), CaC₂O₄ (білий), жовтий амоній фосфомолібдат.', eq: reactions.SO4.equations[0] },
    { icon: '🧪', title: 'Зміна кольору індикатора', text: 'Вологий червоний лакмус у парах аміаку синіє: це ознака лужного газу NH₃.' },
    { icon: '🫧', title: 'Виділення газу', text: 'Солі амонію з лугом при нагріванні виділяють аміак.', eq: reactions.NH4.equations[0] },
    { icon: '🔥', title: 'Забарвлення полум’я', text: 'K⁺ забарвлює полум’я у фіолетовий колір. Натрій його маскує, тому дивляться крізь синє кобальтове скло. У лабораторії AgroSim цю пробу поки не змодельовано.' },
    { icon: '🟤', title: 'Забарвлений комплекс', text: 'Буре кільце на межі шарів — це нітрозильний комплекс заліза(II), а не осад. Реакція двостадійна, подана схематично.', eq: reactions.NO3.equations[1] },
  ];
  return (
    <>
      <section className="card">
        <div className="sec-head">
          <Activity size={20} className="sec-ico" aria-hidden="true" />
          <h3>1.1. Що таке якісний аналіз добрив?</h3>
          <span className="badge">ТЕОРІЯ</span>
        </div>
        <p><b>Якісний аналіз</b> відповідає на питання «що міститься у зразку?», <b>кількісний</b> — «скільки?». У цьому практикумі ми встановлюємо склад мінеральних добрив за характерними реакціями їхніх йонів.</p>
        <ul className="plain">
          <li><b>Катіони:</b> NH₄⁺, K⁺, Ca²⁺. <b>Аніони:</b> NO₃⁻, PO₄³⁻ (у суперфосфатах — H₂PO₄⁻), SO₄²⁻, Cl⁻.</li>
          <li><b>Специфічна реакція</b> виявляє один йон у присутності інших; <b>групова</b> — цілу групу йонів, тому потребує підтвердження.</li>
          <li><b>Головне:</b> реакція виявляє <u>йон</u>, а не добриво. NH₄⁺ є в NH₄NO₃, (NH₄)₂SO₄ і NH₄Cl; сечовина CO(NH₂)₂ іона NH₄⁺ не містить. Добриво встановлюють лише за сукупністю результатів.</li>
        </ul>
      </section>

      <div className="sec-head" style={{ marginTop: 22 }}>
        <Layers size={20} className="sec-ico" aria-hidden="true" />
        <h3>1.2. Основні аналітичні ознаки</h3>
        <span className="badge">КЛАСИФІКАЦІЯ</span>
      </div>

      <div className="theory-grid">
        {signs.map((s) => (
          <section className="card" key={s.title}>
            <b style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
              <span>{s.icon}</span>
              <span>{s.title}</span>
            </b>
            <p style={{ marginBottom: s.eq ? 8 : 0 }}>{s.text}</p>
            {s.eq && <code className="eq">{pretty(s.eq)}</code>}
          </section>
        ))}
      </div>

      <p style={{ marginTop: 18 }}>
        <button className="primary" onClick={onOpenLab}>До віртуальної лабораторії →</button>
      </p>
    </>
  );
}

function Cards({ t, onOpenLab }: { t: Dict; onOpenLab: () => void }) {
  return (
    <>
      {Object.values(reactions).map((r) => (
        <details key={r.id}>
          <summary>
            <span>{r.name} <b>{r.ion}</b> — {r.reagent}</span>
            {!r.verified && <span className="badge medium" style={{ marginLeft: 8 }}>Звірка</span>}
          </summary>
          <div style={{ paddingTop: 10 }}>
            <p><b>Умови:</b> {r.conditions}</p>
            <p><b>Методика:</b> {r.method}</p>
            <p><b>Результат:</b> {r.obsPositive}</p>
            {r.equations.map((e) => <code key={e} className="eq">{pretty(e)}</code>)}
            {r.equationNote && <p><small className="note">{r.equationNote}</small></p>}
            <p><b>Значення:</b> {r.significance}</p>
            <p><b>Перешкоди:</b> {r.interferences}</p>
            <p className="hz high">⚠ {r.hazardNote}</p>
            {!r.verified && <p className="unc"><small>Потребує звірки з джерелом (розділ «Джерела»)</small></p>}
            <button className="primary" onClick={onOpenLab}>{t.toExperiment} →</button>
          </div>
        </details>
      ))}
    </>
  );
}

function Phys({ onOpenPhysLab }: { onOpenPhysLab: () => void }) {
  return (
    <>
      <section className="card" style={{ marginBottom: 14 }}>
        <div className="sec-head">
          <FileSpreadsheet size={20} className="sec-ico" aria-hidden="true" />
          <h3>Фізичні властивості мінеральних добрив</h3>
          <span className="badge">ДОВІДНИК</span>
        </div>
        <p>Фізичні властивості допомагають відрізнити добрива, коли хімічні реакції не розрізняють їх (наприклад, MAP і DAP мають однаковий йонний склад). <b>CRH</b> (критична відносна вологість) — вологість повітря, вище якої сіль поглинає воду з атмосфери; чим вона нижча, тим гігроскопічніше добриво.</p>
        <p className="unc" style={{ marginBottom: 0 }}><small>Усі значення взято з вторинних довідкових джерел і потребують звірки (розділ «Джерела»). Для MAP і DAP числа CRH у джерелах суперечать одне одному, тому не наводяться. Колір для більшості добрив змінний і не є надійною ознакою.</small></p>
      </section>
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tablewrap"><table className="qtable ptable">
          <thead><tr><th>Добриво</th><th>Вигляд (типовий)</th><th>Розчинність, г/100 мл, 20 °C</th><th>CRH, %, 30 °C</th><th>Розчин</th></tr></thead>
          <tbody>
            {fertilizers.map((f) => {
              const p = physical[f.id];
              const ph = p.phText ?? (p.acidic === null ? '—' : p.acidic ? 'слабокислий' : 'нейтральний');
              return <tr key={f.id}><td><b>{f.name}</b><br /><small className="note">{f.formula}</small></td><td>{p.look}</td><td>{fmt(p.solubility20)}</td><td>{fmt(p.crh30)}</td><td>{ph}</td></tr>;
            })}
          </tbody>
        </table></div>
      </section>
      <p style={{ marginTop: 16 }}><button className="primary" onClick={onOpenPhysLab}>До лабораторії фізичних властивостей →</button></p>
    </>
  );
}

function Refs() {
  return (
    <section className="card">
      <div className="sec-head">
        <BookMarked size={20} className="sec-ico" aria-hidden="true" />
        <h3>Нормативні та довідкові джерела</h3>
        <span className="badge">БІБЛІОГРАФІЯ</span>
      </div>
      <p className="note">Навчальні посібники, стандарти ДСТУ EN та довідкові матеріали, використані для верифікації методик якісного аналізу та фізико-хімічних констант добрив.</p>
      <ol className="plain">
        {references.map((r) => (
          <li key={r.id}>
            <span className={`badge ${r.status === 'todo' ? 'medium' : 'low'}`}>{STATUS[r.status]}</span>{' '}
            {r.note}{r.url && <> <a href={r.url} target="_blank" rel="noreferrer">джерело ↗</a></>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TheoryView({ t, onOpenLab, onOpenPhysLab }: { t: Dict; onOpenLab: () => void; onOpenPhysLab: () => void }) {
  const [sec, setSec] = useState<Section>('basics');
  const items: [Section, string, string][] = [
    ['basics', '🌱', 'Основи аналізу'],
    ['cards', '🧪', 'Картки реакцій'],
    ['phys', '💧', 'Фізичні властивості'],
    ['refs', '📚', 'Джерела'],
  ];
  return (
    <>
      <section className="card" style={{ marginBottom: 14 }}>
        <p style={{ margin: 0 }}>{t.theoryIntro}</p>
      </section>
      <div role="group" aria-label="Розділ теорії" className="seg seg-bar" style={{ marginBottom: 16 }}>
        {items.map(([k, ico, l]) => (
          <button key={k} aria-pressed={sec === k} onClick={() => setSec(k)}>
            <span aria-hidden="true">{ico}</span> <span>{l}</span>
          </button>
        ))}
      </div>
      {sec === 'basics' && <Basics onOpenLab={onOpenLab} />}
      {sec === 'cards' && <Cards t={t} onOpenLab={onOpenLab} />}
      {sec === 'phys' && <Phys onOpenPhysLab={onOpenPhysLab} />}
      {sec === 'refs' && <Refs />}
    </>
  );
}