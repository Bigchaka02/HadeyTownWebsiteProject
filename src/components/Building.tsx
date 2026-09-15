import type { Building } from "../town";

type Props = {
  building: Building;
  active: boolean; // the character is heading here (or standing here)
  onClick: () => void;
};

// A building on the map: an optional image drawn over the map, an invisible button
// covering the clickable area, and its name sign. Positions are world pixels (town.ts).
export default function BuildingView({ building: b, active, onClick }: Props) {
  return (
    <div className="building">
      {b.sprite && (
        <img
          className="building-img"
          src={b.sprite.src}
          alt=""
          draggable={false}
          style={{ left: b.sprite.x, top: b.sprite.y, width: b.sprite.size, height: b.sprite.size }}
        />
      )}
      <button
        type="button"
        className="hotspot"
        aria-label={`Walk to ${b.label}`}
        style={{ left: b.hitbox.x, top: b.hitbox.y, width: b.hitbox.w, height: b.hitbox.h }}
        onClick={onClick}
      />
      <span className="sign" data-active={active} style={{ left: b.sign.x, top: b.sign.y }}>
        {b.label}
      </span>
    </div>
  );
}
