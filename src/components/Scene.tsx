import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Sprite from "./Sprite";
import Character from "./Character";
import BuildingView from "./Building";
import { useWalker } from "../walker";
import {
  AMBIENT,
  BUILDINGS,
  ENTRANCE,
  FOREGROUND,
  MAP_IMAGE,
  MAP_VIEW,
  NODES,
  buildingById,
  findRoute,
  type PageId,
} from "../town";

type Props = {
  visit: { id: PageId; n: number } | null; // the building the character should walk to
  onSelect: (id: PageId) => void; // a building was clicked
  onArrive: (id: PageId) => void; // the character reached the building
};

export default function Scene({ visit, onSelect, onArrive }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const hero = useWalker(ENTRANCE);

  // Fit the map into the available space (1/8 steps keep the pixels tidy).
  useLayoutEffect(() => {
    const el = container.current!;
    const fit = () => {
      const s = Math.min(el.clientWidth / MAP_VIEW.w, el.clientHeight / MAP_VIEW.h);
      setScale(Math.max(0.5, Math.floor(s * 8) / 8));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Walk in from the edge of town on load.
  useEffect(() => {
    hero.walk([{ id: "start", ...NODES.start }]);
  }, [hero]);

  // Walk to the requested building; its page opens on arrival.
  useEffect(() => {
    if (!visit) return;
    const { pos, nodes } = hero.location();
    hero.walk(findRoute(pos, nodes, buildingById(visit.id).door), () => onArrive(visit.id));
  }, [visit, hero, onArrive]);

  const { x, y, w, h } = MAP_VIEW;
  const world = { "--scale": scale, transform: `scale(${scale}) translate(${-x}px, ${-y}px)` } as CSSProperties;

  return (
    <div ref={container} className="scene">
      <div className="map" style={{ width: w * scale, height: h * scale }}>
        {/* Everything inside .world is positioned in Tiled world pixels; the transform crops + scales it. */}
        <div className="world" style={world}>
          <img className="map-img" src={MAP_IMAGE} alt="" draggable={false} />
          {AMBIENT.map((a) => (
            <Sprite key={a.src} {...a} />
          ))}
          {BUILDINGS.map((b) => (
            <BuildingView key={b.id} building={b} active={visit?.id === b.id} onClick={() => onSelect(b.id)} />
          ))}
          <Character walker={hero} />
          {FOREGROUND.map((f) => (
            <div
              key={f.x}
              className="foreground"
              style={{
                left: f.x,
                top: f.y,
                width: f.w,
                height: f.h,
                backgroundImage: `url(${MAP_IMAGE})`,
                backgroundPosition: `${-f.x}px ${-f.y}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
