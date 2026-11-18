import { useEffect, useId, useRef, type ReactNode } from 'react';

/** Модальне вікно на нативному <dialog>: Esc закриває, фокус утримується всередині, клік по тлу закриває. */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className={`modal${wide ? ' wide' : ''}`} aria-labelledby={id} onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="modal-in">
        <div className="modal-head"><h2 id={id}>{title}</h2><button onClick={onClose} aria-label="Закрити">✕</button></div>
        {open && children}
      </div>
    </dialog>
  );
}
