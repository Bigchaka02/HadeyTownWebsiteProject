import { useEffect, useRef } from "react";
import { PAGES } from "../content";
import type { PageId } from "../town";

type Props = { page: PageId | null; onClose: () => void };

// RPG-style window that opens once the character reaches a building.
export default function Dialog({ page, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!page) return;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, onClose]);

  if (!page) return null;
  const { title, body } = PAGES[page];

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section
        className="dialog"
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
