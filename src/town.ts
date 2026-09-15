// Town layout: buildings, the paths the character can walk on, and route finding.
// All coordinates are Tiled "world" pixels of ExteriorMap.png (768x512).

import monkHouse from "./assets/full_house_animation/PNG/monk_house.png";
import clockTower from "./assets/full_house_animation/PNG/clock_tower.png";

export type Point = { x: number; y: number };
export type Dir = "down" | "up" | "left" | "right";
export type PageId = "about" | "projects" | "resume";

// The part of the map image that is actually drawn (the Tiled export has transparent margins).
export const MAP_VIEW = { x: 224, y: 154, w: 432, h: 296 };

// ---- Walkable graph -------------------------------------------------------
// Nodes sit on the cobblestone roads. The character only ever walks node to node.
// `face` is the direction to turn to on arrival (doors are above the character).
export const NODES = {
  start:     { x: 384, y: 396, face: "down" }, // where the character stands after arriving in town
  monkDoor:  { x: 285, y: 396, face: "up" },   // in front of the small house (its door opens onto the road)
  roadMain:  { x: 462, y: 396 },               // road junction below the garden gate
  gate:      { x: 462, y: 360 },               // opening in the fence
  mainDoor:  { x: 462, y: 304, face: "up" },   // doorstep of the main house
  roadClock: { x: 608, y: 396 },               // road junction below the clock tower path
  clockDoor: { x: 608, y: 366, face: "up" },   // doorstep of the clock tower
} as const satisfies Record<string, Point & { face?: Dir }>;

export type NodeId = keyof typeof NODES;
export type Waypoint = Point & { id: NodeId; face?: Dir };

const EDGES: [NodeId, NodeId][] = [
  ["monkDoor", "start"],
  ["start", "roadMain"],
  ["roadMain", "gate"],
  ["gate", "mainDoor"],
  ["roadMain", "roadClock"],
  ["roadClock", "clockDoor"],
];

// ---- Buildings ------------------------------------------------------------
export type Building = {
  id: PageId;
  label: string; // text on the sign
  door: NodeId; // where the character walks to
  sign: Point; // centre of the name sign
  hitbox: { x: number; y: number; w: number; h: number }; // clickable area (world px)
  sprite?: { src: string; x: number; y: number; size: number }; // drawn over the map (the main house is part of the map itself)
};

export const BUILDINGS: Building[] = [
  {
    id: "about",
    label: "About Me",
    door: "mainDoor",
    sign: { x: 444, y: 222 },
    hitbox: { x: 356, y: 178, w: 176, h: 146 },
  },
  {
    id: "projects",
    label: "Projects",
    door: "monkDoor",
    sign: { x: 286, y: 302 },
    sprite: { src: monkHouse, x: 246, y: 314, size: 80 },
    hitbox: { x: 254, y: 318, w: 64, h: 70 },
  },
  {
    id: "resume",
    label: "Resume",
    door: "clockDoor",
    sign: { x: 609, y: 250 },
    sprite: { src: clockTower, x: 530, y: 231, size: 160 },
    hitbox: { x: 566, y: 262, w: 86, h: 98 },
  },
];

export const buildingById = (id: PageId) => BUILDINGS.find((b) => b.id === id)!;

// ---- Route finding --------------------------------------------------------
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const neighbours = (id: NodeId): NodeId[] =>
  EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

// Dijkstra on a handful of nodes: returns the node sequence from `from` to `to`
// (inclusive of both) and its length.
function shortestPath(from: NodeId, to: NodeId): { path: NodeId[]; length: number } {
  const best = new Map<NodeId, number>([[from, 0]]);
  const prev = new Map<NodeId, NodeId>();
  const open = new Set<NodeId>([from]);

  while (open.size) {
    let cur!: NodeId;
    for (const n of open) if (cur === undefined || best.get(n)! < best.get(cur)!) cur = n;
    open.delete(cur);
    if (cur === to) break;
    for (const n of neighbours(cur)) {
      const d = best.get(cur)! + dist(NODES[cur], NODES[n]);
      if (d < (best.get(n) ?? Infinity)) {
        best.set(n, d);
        prev.set(n, cur);
        open.add(n);
      }
    }
  }

  const path: NodeId[] = [];
  for (let n: NodeId | undefined = to; n !== undefined; n = prev.get(n)) path.unshift(n);
  return { path, length: best.get(to) ?? Infinity };
}

/**
 * Builds the list of waypoints the character should walk through.
 * `from` is where the character is right now; `candidates` are the graph nodes it can head to
 * directly (one node when standing still, the two ends of its current segment while walking).
 */
export function findRoute(from: Point, candidates: NodeId[], to: NodeId): Waypoint[] {
  let bestPath: NodeId[] = [to];
  let bestLength = Infinity;
  for (const c of candidates) {
    const { path, length } = shortestPath(c, to);
    const total = dist(from, NODES[c]) + length;
    if (total < bestLength) {
      bestLength = total;
      bestPath = path;
    }
  }
  return bestPath.map((id) => ({ id, ...NODES[id] }));
}
