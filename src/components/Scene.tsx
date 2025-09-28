import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Sprite from "./Sprite";
// your map path:
import rawMap from "../assets/full_house_animation/PNG/ExteriorMap.png";

// sprite sheets
import smokeSheet from "../assets/full_house_animation/PNG/Smoke_animation.png";
import treesSheet from "../assets/full_house_animation/PNG/Trees_animation.png";
import birdSheet  from "../assets/full_house_animation/PNG/bird_fly_animation.png";
import catSheet   from "../assets/full_house_animation/PNG/cat_animation.png";

// static house images
import monkHouse from "../assets/full_house_animation/PNG/monk_house.png";
import clockHouse from "../assets/full_house_animation/PNG/clock_tower.png";

type Size = { w: number; h: number };
type Crop = { x: number; y: number; w: number; h: number };

function House({
    src,
    x,
    y,
    label,
    onClick,
  }: {
    src: string;
    x: number;
    y: number;
    label: string;
    onClick?: () => void;
  }) {
    return (
      <img
        src={src}
        alt={label}
        aria-label={label}
        style={{
          position: "absolute",
          left: x,
          top: y,
          imageRendering: "pixelated",
          display: "block",
          pointerEvents: "auto", // ready for clicks in Part 2
          userSelect: "none",
          transform: `scale(${1.24})`,
        }}
        draggable={false}
        onClick={onClick}
      />
    );
  }

export default function Scene() {
  const [url, setUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<Size | null>(null); // cropped size
  const [crop, setCrop] = useState<Crop | null>(null);       // crop offsets in source

  // rendered scale (img width / natural.w) so overlay matches exactly
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // ---- 1) Load & crop once ----
  useEffect(() => {
    const img = new Image();
    img.src = rawMap;
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;

      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, w, h);
      let minX = w, minY = h, maxX = -1, maxY = -1;
      const THRESH = 8; // alpha threshold

      for (let y = 0; y < h; y++) {
        const row = y * w * 4;
        for (let x = 0; x < w; x++) {
          const a = data[row + x * 4 + 3];
          if (a > THRESH) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < 0 || maxY < 0) {
        setUrl(rawMap);
        setNatural({ w, h });
        setCrop({ x: 0, y: 0, w, h });
        return;
      }

      const cw = maxX - minX + 1, ch = maxY - minY + 1;

      const out = document.createElement("canvas");
      out.width = cw; out.height = ch;
      out.getContext("2d")!.drawImage(img, minX, minY, cw, ch, 0, 0, cw, ch);

      setUrl(out.toDataURL("image/png"));
      setNatural({ w: cw, h: ch });
      setCrop({ x: minX, y: minY, w: cw, h: ch });
      // Helpful for precise placement from Tiled world coords:
      console.log("CROP OFFSETS (subtract these): x:", minX, " y:", minY);
      console.log("CROPPED SIZE:", cw, "x", ch);
    };
  }, []);

  // ---- 2) Track on-screen scale from the rendered <img> width (80vw) ----
  useLayoutEffect(() => {
    if (!natural || !imgRef.current) return;

    const update = () => {
      const renderedW = imgRef.current!.clientWidth; // equals 80vw
      setScale(renderedW / natural.w);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [natural]);

  if (!url || !natural) return null;

  // === Helper: place sprites using world coords from Tiled (optional) ===

  const toLocal = (worldX: number, worldY: number) => {
    const cx = crop?.x ?? 0, cy = crop?.y ?? 0;
    return { x: worldX - cx, y: worldY - cy };
  };

  const smokePos = toLocal(368, 160);
  const treePos  = toLocal(140+372, 120+55);
  const birdPos  = toLocal(220, 290); 
  const catPos   = toLocal(544, 320); 

  const monkPos = toLocal(322, 364);
  const clockPos = toLocal(554, 248);

  // on-screen size of the map (useful for an overlay wrapper)
  const layoutW = Math.round(natural.w * scale);
  const layoutH = Math.round(natural.h * scale);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        placeItems: "center",
        background: "#0f0f10",
        overflow: "hidden",
      }}
    >
      {/* Wrapper sized to the rendered image. This keeps overlay perfectly aligned. */}
      <div style={{ position: "relative", width: layoutW, height: layoutH }}>
        {/* Background image (cropped) */}
        <img
          ref={imgRef}
          src={url}
          alt="HadeyTown"
          draggable={false}
          style={{
            width: "80vw", // your chosen width rule
            height: "auto",
            display: "block",
            imageRendering: "pixelated",
          }}
        />

        {/* World overlay: unscaled map coords, then transformed to the same on-screen scale */}
        <div
          style={{
            position: "absolute",
            left: 0, // center overlay
            top: 0,
            width: natural.w,
            height: natural.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none", // flip to 'auto' when you need clicks
          }}
        >

         
          <Sprite
            src={smokeSheet}
            frameWidth={48}
            frameHeight={48}
            frames={6}         
            fps={4}
            x={smokePos.x}
            y={smokePos.y}
            orientation="horizontal"
          />

          <Sprite
            src={treesSheet}
            frameWidth={8*8}
            frameHeight={10*8}   
            frames={13}        
            fps={5}
            x={treePos.x}
            y={treePos.y}
            orientation="vertical"
          />

          {/* Bird fly */}
          <Sprite
            src={birdSheet}
            frameWidth={18*8}
            frameHeight={8*8}
            frames={16}         // <- set to actual
            fps={6}
            x={birdPos.x}
            y={birdPos.y}
            orientation="vertical"
          />

          {/* Cat idle/walk */}
          <Sprite
            src={catSheet}
            frameWidth={32}
            frameHeight={32}
            frames={17*3}         // <- set to actual
            fps={8}
            x={catPos.x}
            y={catPos.y}
            orientation="vertical"
          />
          {/* === Static houses === */}
          <House src={monkHouse}  x={monkPos.x}  y={monkPos.y}  label="Monk House" />
          <House src={clockHouse} x={clockPos.x} y={clockPos.y} label="Clock Tower" />
        </div>
      </div>
    </div>
  );
}
