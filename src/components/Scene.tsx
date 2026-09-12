import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Sprite from "./Sprite";
import Character, { type CharacterHandle } from "./Character";
import BuildingView from "./Building";
import { BUILDINGS, buildingById, findRoute, type PageId } from "../town";

import rawMap from "../assets/full_house_animation/PNG/ExteriorMap.png";
import smokeSheet from "../assets/full_house_animation/PNG/Smoke_animation.png";
import treesSheet from "../assets/full_house_animation/PNG/Trees_animation.png";
import birdSheet from "../assets/full_house_animation/PNG/bird_fly_animation.png";
import catSheet from "../assets/full_house_animation/PNG/cat_animation.png";

// Opaque bounds of the map image (the Tiled export has transparent margins).
type Crop = { x: number; y: number; w: number; h: number };

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
  const [crop, setCrop] = useState<Crop | null>(null);
  const [scale, setScale] = useState(1);
  const [hovered, setHovered] = useState<PageId | null>(null);
  const [destination, setDestination] = useState<PageId | null>(null);

  // ---- 1) Find the opaque bounds of the map once ----
  useEffect(() => {
    const img = new Image();
    img.src = rawMap;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, w, h);

      let minX = w, minY = h, maxX = -1, maxY = -1;
      const THRESH = 8; // alpha threshold
      for (let y = 0; y < h; y++) {
        const row = y * w * 4;
        for (let x = 0; x < w; x++) {
          if (data[row + x * 4 + 3] > THRESH) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) setCrop({ x: 0, y: 0, w, h });
      else setCrop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    };
  }, []);

  // ---- 2) Fit the cropped map into the available space ----
  useLayoutEffect(() => {
    const el = container.current;
    if (!crop || !el) return;
    const fit = () => {
      const s = Math.min(el.clientWidth / crop.w, el.clientHeight / crop.h);
      setScale(Math.max(0.5, Math.floor(s * 8) / 8)); // snap to 1/8 steps so pixels stay tidy
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [crop]);

  // ---- 3) Walk in from the edge of town once the map is ready ----
  useEffect(() => {
    character.current?.walk(findRoute(ENTRANCE, ["start"], "start"));
  }, [crop]);

  // ---- 4) Walk to a building when asked (map click or HUD button) ----
  const arrive = useRef(onArrive);
  useEffect(() => {
    arrive.current = onArrive;
  });
  useEffect(() => {
    const c = character.current;
    if (!visit || !c) return;
    const b = buildingById(visit.id);
    const { pos, nodes, walking } = c.location();
    setDestination(visit.id);
    if (!walking && nodes[0] === b.door) {
      arrive.current(visit.id); // already standing at the door
      return;
    }
    c.walk(findRoute(pos, nodes, b.door), () => arrive.current(visit.id));
  }, [visit, crop]);

  return (
    <div ref={container} className="scene">
      {crop && (
        <div className="map" style={{ width: crop.w * scale, height: crop.h * scale }}>
          {/* Everything inside .world uses Tiled world pixels; the transform crops + scales it. */}
          <div
            className="world"
            style={{ transform: `scale(${scale}) translate(${-crop.x}px, ${-crop.y}px)` }}
          >
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
                data-active={hovered === b.id || destination === b.id}
                style={{ left: (b.sign.x - crop.x) * scale, top: (b.sign.y - crop.y) * scale }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
