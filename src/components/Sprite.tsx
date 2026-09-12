import type { CSSProperties } from "react";

type SpriteProps = {
  src: string;
  frameWidth: number;   // width of one frame in pixels
  frameHeight: number;  // height of one frame in pixels
  frames: number;       // total number of frames in the sheet
  fps?: number;         // frames per second (default 8)
  x: number;            // position in MAP pixels (unscaled)
  y: number;            // position in MAP pixels (unscaled)
  orientation?: "horizontal" | "vertical";
};

export default function Sprite({
  src,
  frameWidth,
  frameHeight,
  frames,
  fps = 8,
  x,
  y,
  orientation = "vertical",
}: SpriteProps) {
  const duration = `${frames / fps}s`;
  const endX = orientation === "horizontal" ? `-${frameWidth * frames}px` : "0px";
  const endY = orientation === "vertical" ? `-${frameHeight * frames}px` : "0px";

  // CSS vars are consumed by @keyframes sprite-steps in index.css
  const style = {
    left: x,
    top: y,
    width: frameWidth,
    height: frameHeight,
    backgroundImage: `url(${src})`,
    "--bg-end-x": endX,
    "--bg-end-y": endY,
    "--frames": frames,
    "--duration": duration,
  } as CSSProperties;

  return <div className="sprite" style={style} aria-hidden />;
}
