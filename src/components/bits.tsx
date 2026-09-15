import type { ReactNode } from "react";

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
