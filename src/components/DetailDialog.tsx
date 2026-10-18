import { useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, X } from 'lucide-react';
import { useMission } from '../store';

/** Native modal gives every archive record the same focus and scroll boundary. */
export function DetailDialog({ title, code, children, onClose, closeLabel = 'Close details' }: {
  title: string; code: string; children: React.ReactNode; onClose: () => void; closeLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const reduced = useMission(s => s.motionReduced);
  useLayoutEffect(() => {
    const element = dialog.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    heading.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<dialog ref={dialog} className={`record-dialog ${reduced ? 'reduce-motion' : ''}`}
    aria-modal="true" aria-labelledby={titleId} data-testid="record-dialog"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      event.stopPropagation();
      if (event.key !== 'Tab') return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="record-dialog-shell">
      <header className="record-dialog-toolbar"><span>ARCHIVE / EXPANDED RECORD</span>
        <button type="button" onClick={onClose} aria-label={closeLabel}><X size={20}/><span>CLOSE</span></button>
      </header>
      <div className="record-dialog-scroll" tabIndex={0} role="region" aria-label={`${title} details`}>
        <div className="record-dialog-heading"><span className="eyebrow micro">{code}</span>
          <h2 ref={heading} tabIndex={-1} id={titleId}>{title}</h2>
        </div>
        <div className="record-dialog-content">{children}</div>
      </div>
      <footer className="record-dialog-footer"><ArrowDown size={14}/><span>SCROLL TO EXPLORE · ESC TO CLOSE</span></footer>
    </div>
  </dialog>, document.body);
}
