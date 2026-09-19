import { useCallback, useEffect, useState } from "react";
import Scene from "./components/Scene";
import Dialog from "./components/Dialog";
import { SITE } from "./content";
import { BUILDINGS, type PageId } from "./town";

const isPage = (s: string): s is PageId => BUILDINGS.some((b) => b.id === s);

export default function App() {
  const [page, setPage] = useState<PageId | null>(null); // dialog currently open
  const [visit, setVisit] = useState<{ id: PageId; n: number } | null>(null); // where the character should go
  const [walkingTo, setWalkingTo] = useState<PageId | null>(null); // building the character hasn't reached yet

  // Send the character to a building; the page opens when it gets there.
  // A repeat click on the building already being walked to is ignored instead
  // of restarting the walk.
  const go = useCallback(
    (id: PageId) => {
      if (walkingTo === id) return;
      setPage(null);
      setWalkingTo(id);
      setVisit((v) => ({ id, n: (v?.n ?? 0) + 1 }));
    },
    [walkingTo]
  );

  const open = useCallback((id: PageId) => {
    setPage(id);
    setWalkingTo(null);
    history.replaceState(null, "", `#${id}`);
  }, []);

  const close = useCallback(() => {
    setPage(null);
    history.replaceState(null, "", location.pathname + location.search);
  }, []);

  // Deep links: /#about, /#projects, /#resume (on load and whenever the hash is edited).
  useEffect(() => {
    const sync = () => {
      const id = location.hash.slice(1);
      if (isPage(id)) go(id);
    };
    sync();
    addEventListener("hashchange", sync);
    return () => removeEventListener("hashchange", sync);
  }, [go]);

  return (
    <>
      <header className="hud">
        <div className="hud-title">
          <h1>Hadey Town</h1>
          <p>
            {SITE.name} · {SITE.tagline}
          </p>
        </div>
        <nav className="hud-nav" aria-label="Places">
          {BUILDINGS.map((b) => (
            <button key={b.id} type="button" onClick={() => go(b.id)} data-active={page === b.id}>
              {b.label}
            </button>
          ))}
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </nav>
      </header>

      <Scene visit={visit} onSelect={go} onArrive={open} />

      <footer className="hud-foot" data-visible={visit === null}>
        ▸ Click a building and I’ll walk over
      </footer>

      <Dialog page={page} onClose={close} />
    </>
  );
}
