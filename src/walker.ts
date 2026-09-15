// Moves the character along a route of road nodes and animates its sprite sheet.
// Position and frame are written straight to the DOM node on each animation
// frame, so React never re-renders while the character walks.
import { useEffect, useRef } from "react";
import type { Dir, NodeId, Point, Waypoint } from "./town";

// character.png: rows = facing, columns = walk cycle (stand, step, stand, other step).
export const FRAME = { w: 18, h: 32, feet: 30 }; // cell size and the feet baseline inside it
const ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };
const STEP_PX = 8; // world px travelled per walk-cycle frame
const SPEED = 72; // world px per second

const dirOf = (from: Point, to: Point): Dir => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
};

export type Walker = ReturnType<typeof createWalker>;

export function createWalker(start: Waypoint) {
  let el: HTMLDivElement | null = null;
  let pos: Point = { x: start.x, y: start.y };
  let from: NodeId = start.id; // last node reached
  let route: Waypoint[] = [];
  let next = 0; // index into route of the waypoint being walked to
  let dir: Dir = start.face ?? "down";
  let travelled = 0;
  let last = 0; // timestamp of the previous animation frame
  let raf = 0;
  let onArrive: (() => void) | undefined;

  const walking = () => next < route.length;

  const draw = () => {
    if (!el) return;
    const col = walking() ? Math.floor(travelled / STEP_PX) % 4 : 0;
    el.style.transform = `translate(${pos.x - FRAME.w / 2}px, ${pos.y - FRAME.feet}px)`;
    el.style.backgroundPosition = `${-col * FRAME.w}px ${-ROW[dir] * FRAME.h}px`;
  };

  // Move `px` along the route. Returns true once the last waypoint is reached.
  const advance = (px: number) => {
    while (walking()) {
      const target = route[next];
      const d = Math.hypot(target.x - pos.x, target.y - pos.y);
      if (d > px) {
        dir = dirOf(pos, target);
        pos = { x: pos.x + ((target.x - pos.x) / d) * px, y: pos.y + ((target.y - pos.y) / d) * px };
        travelled += px;
        return false;
      }
      pos = { x: target.x, y: target.y };
      from = target.id;
      dir = target.face ?? dir; // doors face the character towards the door
      next++;
      px -= d;
    }
    return true;
  };

  const finish = () => {
    const cb = onArrive;
    onArrive = undefined;
    draw();
    cb?.();
  };

  const tick = (t: number) => {
    const dt = Math.min((t - last) / 1000, 0.1); // a tab that was hidden shouldn't teleport
    last = t;
    if (advance(dt * SPEED)) return finish();
    draw();
    raf = requestAnimationFrame(tick);
  };

  const resume = () => {
    cancelAnimationFrame(raf);
    draw();
    if (!walking()) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  return {
    /** The DOM node to animate (ref callback). */
    attach(node: HTMLDivElement | null) {
      el = node;
      draw();
    },
    resume,
    pause: () => cancelAnimationFrame(raf),
    /** Walk through `route`; `cb` fires on arrival (dropped if another walk interrupts). */
    walk(newRoute: Waypoint[], cb?: () => void) {
      route = newRoute;
      next = 0;
      onArrive = cb;
      if (advance(0)) return finish(); // already there
      resume();
    },
    /** Where the character is, and which nodes it can head to directly from there. */
    location: () => ({
      pos: { ...pos },
      nodes: [...new Set<NodeId>(walking() ? [from, route[next].id] : [from])],
    }),
  };
}

// Creates the walker once; its animation loop pauses while the component is unmounted.
export function useWalker(start: Waypoint): Walker {
  const ref = useRef<Walker>(null);
  if (ref.current === null) ref.current = createWalker(start);
  useEffect(() => {
    const w = ref.current!;
    w.resume();
    return () => w.pause();
  }, []);
  return ref.current;
}
