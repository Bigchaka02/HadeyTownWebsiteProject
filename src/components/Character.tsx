import { useEffect, useImperativeHandle, useRef, type Ref, type RefObject } from "react";
import sheet from "../assets/character.png";
import type { Dir, NodeId, Point, Waypoint } from "../town";

// character.png: 18x32 frames. Columns = walk cycle (stand, step, stand, other step), rows = facing.
const FRAME_W = 18;
const FRAME_H = 32;
const FEET_Y = 30; // baseline of the feet inside a frame
const STEP_PX = 8; // world px travelled per walk-cycle frame
const SPEED = 72; // world px per second

const ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };

export type CharacterHandle = {
  /** Walk through `route`; `onArrive` fires at the last waypoint (dropped if a new walk interrupts). */
  walk: (route: Waypoint[], onArrive?: () => void) => void;
  /** Where the character is and which graph nodes it can head to directly from there. */
  location: () => { pos: Point; nodes: NodeId[]; walking: boolean };
};

type Props = {
  ref: Ref<CharacterHandle>;
  at: Waypoint; // initial position (may be off-map: the node id is where it will head first)
};

const dirOf = (from: Point, to: Point): Dir => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
};

// The walking state machine. It lives outside React's render cycle: position and
// animation frame are written straight to the DOM node each animation frame.
function createWalker(at: Waypoint, el: RefObject<HTMLDivElement | null>) {
  let pos: Point = { x: at.x, y: at.y };
  let from: NodeId = at.id; // last node reached
  let route: Waypoint[] = [];
  let next = 0; // index into route of the waypoint being walked to
  let dir: Dir = "down";
  let travelled = 0;
  let last = 0; // timestamp of the previous frame
  let raf = 0;
  let onArrive: (() => void) | undefined;

  const draw = (col: number) => {
    const node = el.current;
    if (!node) return;
    node.style.transform = `translate(${pos.x - FRAME_W / 2}px, ${pos.y - FEET_Y}px)`;
    node.style.backgroundPosition = `${-col * FRAME_W}px ${-ROW[dir] * FRAME_H}px`;
  };

  const finish = () => {
    const end = route[route.length - 1];
    pos = { x: end.x, y: end.y };
    from = end.id;
    route = [];
    next = 0;
    dir = end.face ?? dir;
    draw(0);
    const cb = onArrive;
    onArrive = undefined;
    cb?.();
  };

  const tick = (t: number) => {
    let step = ((t - last) / 1000) * SPEED;
    last = t;
    if (step > SPEED / 10) step = SPEED / 10; // tab was hidden: don't teleport

    while (step > 0 && next < route.length) {
      const target = route[next];
      const d = Math.hypot(target.x - pos.x, target.y - pos.y);
      if (d <= step) {
        pos = { x: target.x, y: target.y };
        from = target.id;
        next++;
        step -= d;
      } else {
        pos.x += ((target.x - pos.x) / d) * step;
        pos.y += ((target.y - pos.y) / d) * step;
        travelled += step;
        step = 0;
      }
    }

    if (next >= route.length) {
      finish();
      return;
    }
    dir = dirOf(pos, route[next]);
    draw(Math.floor(travelled / STEP_PX) % 4);
    raf = requestAnimationFrame(tick);
  };

  const resume = () => {
    cancelAnimationFrame(raf);
    if (next >= route.length) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  return {
    draw: () => draw(0),
    resume,
    pause: () => cancelAnimationFrame(raf),
    walk(newRoute: Waypoint[], cb?: () => void) {
      route = newRoute;
      next = 0;
      onArrive = cb;
      if (route.length === 0) {
        onArrive = undefined;
        cb?.();
        return;
      }
      resume();
    },
    location() {
      const walking = next < route.length;
      const nodes: NodeId[] = walking ? [from, route[next].id] : [from];
      return { pos: { ...pos }, nodes: [...new Set(nodes)], walking };
    },
  };
}

export default function Character({ ref, at }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const walker = useRef<ReturnType<typeof createWalker>>(null);
  if (walker.current === null) walker.current = createWalker(at, el);

  // Pause the animation loop while unmounted (StrictMode remounts in dev) and pick it back up.
  useEffect(() => {
    const w = walker.current!;
    w.draw();
    w.resume();
    return () => w.pause();
  }, []);

  useImperativeHandle(ref, () => {
    const w = walker.current!;
    return { walk: w.walk, location: w.location };
  }, []);

  return (
    <div
      ref={el}
      className="character"
      style={{ width: FRAME_W, height: FRAME_H, backgroundImage: `url(${sheet})` }}
      aria-hidden
    />
  );
}
