import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Sprite from "./Sprite";
import Character, { type CharacterHandle } from "./Character";
import BuildingView from "./Building";
import { BUILDINGS, MAP_VIEW, NODES, buildingById, findRoute, type PageId } from "../town";

import rawMap from "../assets/full_house_animation/PNG/ExteriorMap.png";
import smokeSheet from "../assets/full_house_animation/PNG/Smoke_animation.png";
import treesSheet from "../assets/full_house_animation/PNG/Trees_animation.png";
import birdSheet from "../assets/full_house_animation/PNG/bird_fly_animation.png";
import catSheet from "../assets/full_house_animation/PNG/cat_animation.png";

type Props = {
  visit: { id: PageId; n: number } | null; // request to walk to a building
  onSelect: (id: PageId) => void; // a building was clicked
  onArrive: (id: PageId) => void; // the character reached the building
};

// The character walks in from off-map on load.
const ENTRANCE = { id: "start" as const, x: 200, y: 396 };

// Parts of the map drawn in front of the character: the two tree canopies that
// hang over the road (world px; each is clipped to an ellipse in CSS).
const FOREGROUND = [
  { x: 326, y: 368, w: 50, h: 50 }, // round tree left of the garden gate
  { x: 529, y: 371, w: 60, h: 59 }, // apple tree right of the gate
];

export default function Scene({ visit, onSelect, onArrive }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const character = useRef<CharacterHandle>(null);
  const [scale, setScale] = useState(1);
  const [hovered, setHovered] = useState<PageId | null>(null);

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
    character.current?.walk([{ id: "start", ...NODES.start }]);
  }, []);

  // Walk to a building when asked (map click or header button).
  const arrive = useRef(onArrive);
  useEffect(() => {
    arrive.current = onArrive;
  });
  useEffect(() => {
    const c = character.current;
    if (!visit || !c) return;
    const { door } = buildingById(visit.id);
    const { pos, nodes, walking } = c.location();
    if (!walking && nodes[0] === door) return arrive.current(visit.id); // already at the door
    c.walk(findRoute(pos, nodes, door), () => arrive.current(visit.id));
  }, [visit]);

  const { x: vx, y: vy, w, h } = MAP_VIEW;
  return (
    <div ref={container} className="scene">
      <div className="map" style={{ width: w * scale, height: h * scale }}>
        {/* Everything inside .world uses Tiled world pixels; the transform crops + scales it. */}
        <div className="world" style={{ transform: `scale(${scale}) translate(${-vx}px, ${-vy}px)` }}>
            <img className="map-img" src={rawMap} alt="" draggable={false} />

            {/* Ambient animations. Positions are world pixels. */}
            <Sprite src={smokeSheet} frameWidth={48} frameHeight={48} frames={6} fps={4} x={368} y={160} orientation="horizontal" />
            <Sprite src={treesSheet} frameWidth={64} frameHeight={80} frames={13} fps={5} x={512} y={175} />
            <Sprite src={birdSheet} frameWidth={144} frameHeight={64} frames={16} fps={6} x={220} y={290} />
            <Sprite src={catSheet} frameWidth={32} frameHeight={32} frames={18} fps={8} x={544} y={320} />

            {BUILDINGS.map((b) => (
              <BuildingView
                key={b.id}
                building={b}
                onClick={() => onSelect(b.id)}
                onHover={(on) => setHovered((h) => (on ? b.id : h === b.id ? null : h))}
              />
            ))}

            <Character ref={character} at={ENTRANCE} />

            {FOREGROUND.map((f) => (
              <div
                key={f.x}
                className="foreground"
                style={{
                  left: f.x,
                  top: f.y,
                  width: f.w,
                  height: f.h,
                  backgroundImage: `url(${rawMap})`,
                  backgroundPosition: `${-f.x}px ${-f.y}px`,
                }}
              />
            ))}
          </div>

          {/* Signs are drawn in screen pixels so the text stays crisp at any zoom. */}
          <div className="signs">
            {BUILDINGS.map((b) => (
              <span
                key={b.id}
                className="sign"
                data-active={hovered === b.id || visit?.id === b.id}
                style={{ left: (b.sign.x - vx) * scale, top: (b.sign.y - vy) * scale }}
              >
                {b.label}
              </span>
            ))}
          </div>
      </div>
    </div>
  );
}
