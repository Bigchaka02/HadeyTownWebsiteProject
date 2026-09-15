import type { CSSProperties } from "react";
import type { Animation } from "../town";

// One looping sprite-sheet animation, stepped by the CSS keyframes in index.css.
export default function Sprite({ src, frameWidth, frameHeight, frames, fps = 8, x, y, orientation = "vertical" }: Animation) {
  const style = {
    left: x,
    top: y,
    width: frameWidth,
    height: frameHeight,
    backgroundImage: `url(${src})`,
    "--bg-end-x": orientation === "horizontal" ? `-${frameWidth * frames}px` : "0px",
    "--bg-end-y": orientation === "vertical" ? `-${frameHeight * frames}px` : "0px",
    "--frames": frames,
    "--duration": `${frames / fps}s`,
  } as CSSProperties;

  return <div className="sprite" style={style} aria-hidden />;
}
