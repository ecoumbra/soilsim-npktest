import { useState } from 'react';
import { ClipboardCheck, FlaskConical, Scale } from 'lucide-react';
import type { Dict } from '../../i18n';
import { ChemQuiz } from './ChemQuiz';
import { PhysQuiz } from './PhysQuiz';

type Which = 'chem' | 'phys' | null;

/** Вкладка «Перевірка знань»: вибір одного з двох тестів. */
export function QuizView({ t }: { t: Dict }) {
  const [which, setWhich] = useState<Which>(null);
  if (!which) {
    return (
      <>
        <div className="sec-head">
          <ClipboardCheck size={20} className="sec-ico" aria-hidden="true" />
          <h3>{t.quiz}</h3>
          <span className="badge">ПРАКТИКУМ</span>
        </div>
        <div className="theory-grid">
          <section className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div className="sec-head">
                <FlaskConical size={18} className="sec-ico" aria-hidden="true" />
                <h3 style={{ fontSize: '1.05rem' }}>{t.quizChem}</h3>
                <span className="badge low">ХІМІЯ</span>
              </div>
              <p style={{ marginBottom: 0 }}>Реактиви, ознаки реакцій, ідентифікація добрива за йонним складом і віртуальна задача з журналом.</p>
            </div>
            <div>
              <button className="primary" onClick={() => setWhich('chem')}>{t.quizStart} →</button>
            </div>
          </section>

          <section className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div className="sec-head">
                <Scale size={18} className="sec-ico" aria-hidden="true" />
                <h3 style={{ fontSize: '1.05rem' }}>{t.quizPhys}</h3>
                <span className="badge low">ФІЗИКА</span>
              </div>
              <p style={{ marginBottom: 0 }}>Розчинність, гігроскопічність (CRH), pH розчинів, зовнішній вигляд і віртуальна лабораторія фізичних властивостей.</p>
            </div>
            <div>
              <button className="primary" onClick={() => setWhich('phys')}>{t.quizStart} →</button>
            </div>
          </section>
        </div>
      </>
    );
  }
  return (
    <>
      <p style={{ marginTop: 0 }}><button onClick={() => setWhich(null)}>← {t.quizBack}</button></p>
      {which === 'chem' ? <ChemQuiz t={t} /> : <PhysQuiz t={t} />}
    </>
  );
}