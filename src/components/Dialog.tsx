import { useEffect, useRef } from "react";
import { PAGES } from "../content";
import type { PageId } from "../town";

type Props = { page: PageId | null; onClose: () => void };

// RPG-style window that opens once the character reaches a building.
export default function Dialog({ page, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!page) return;
    closeButton.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !dialog.current) return;

      // Keep Tab from leaving the dialog while it's open.
      const focusable = dialog.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, onClose]);

  if (!page) return null;
  const { title, body } = PAGES[page];

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section
        ref={dialog}
        className={`dialog dialog-${page}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dialog-head">
          <h2 id="dialog-title">{title}</h2>
          <button ref={closeButton} type="button" className="dialog-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="dialog-body">{body}</div>
        <footer className="dialog-foot">press Esc or click outside to leave</footer>
      </section>
    </div>
  );
}
