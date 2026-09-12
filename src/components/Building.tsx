import type { Building } from "../town";

type Props = {
  building: Building;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
};

// A building on the map: an optional image drawn over the map plus an invisible
// button covering the clickable area. Positions are in world pixels (see town.ts).
export default function BuildingView({ building: b, onClick, onHover }: Props) {
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
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
      />
    </div>
  );
}
