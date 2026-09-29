import { useEffect, useState, type ReactNode } from "react";

// Row of small labels (tech stack, skills).
export function Tags({ tags }: { tags: string[] }) {
  return (
    <p className="tags">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
        </span>
      ))}
    </p>
  );
}

// Link that opens in a new tab.
export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

// Small button that copies `text` to the clipboard and says so for a moment.
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => {} // clipboard blocked (e.g. insecure context): the link next to it still works
    );
  };

  return (
    <button type="button" className="copy" onClick={copy} aria-label={label}>
      <span aria-live="polite">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
