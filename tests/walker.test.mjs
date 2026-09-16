// Drives the real walker + town graph with a fake animation clock.
import assert from "node:assert/strict";

// ---- fake browser clock ----
let now = 0;
let queue = [];
globalThis.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
globalThis.cancelAnimationFrame = (id) => { if (queue[id - 1]) queue[id - 1] = null; };
globalThis.performance = { now: () => now };
const frame = (ms = 16) => { now += ms; const cbs = queue; queue = []; for (const cb of cbs) cb?.(now); };
const runUntil = (pred, maxFrames = 2000) => { for (let i = 0; i < maxFrames; i++) { if (pred()) return i; frame(); } throw new Error("timeout"); };

const { createWalker, FRAME } = await import("../src/walker.ts");
const { NODES, ENTRANCE, BUILDINGS, findRoute, buildingById } = await import("../src/town.ts");

const el = { style: {} };
const w = createWalker(ENTRANCE);
w.attach(el);
w.resume();
const row = () => parseInt(el.style.backgroundPosition.split(" ")[1]) / -FRAME.h; // 0 down, 1 up, 2 left, 3 right
const col = () => parseInt(el.style.backgroundPosition.split(" ")[0]) / -FRAME.w;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// 1) Intro: entrance -> start at 72 px/s, facing right while walking, down on arrival.
let arrived = 0;
w.walk([{ id: "start", ...NODES.start }], () => arrived++);
frame(16);
ok(row() === 3, "walking right shows the right-facing row");
const t0 = now;
runUntil(() => arrived === 1);
const expected = dist(ENTRANCE, NODES.start) / 72 * 1000;
ok(Math.abs(now - t0 - expected) < 40, `intro takes ~${expected.toFixed(0)}ms (took ${now - t0})`);
ok(dist(w.location().pos, NODES.start) === 0 && w.location().nodes.join() === "start", "standing on the start node");
ok(row() === 0 && col() === 0, "idle frame facing down after the intro");
ok(el.style.transform === `translate(${NODES.start.x - FRAME.w / 2}px, ${NODES.start.y - FRAME.feet}px)`, "sprite anchored at the feet");

// 2) Route to the main house: start -> roadMain -> gate -> mainDoor, faces up at the door.
const seenCols = new Set();
let route = findRoute(w.location().pos, w.location().nodes, buildingById("about").door);
ok(route.map((p) => p.id).join(">") === "start>roadMain>gate>mainDoor", "shortest path to the main house");
arrived = 0;
w.walk(route, () => arrived++);
runUntil(() => { seenCols.add(col()); return arrived === 1; });
ok(row() === 1 && col() === 0, "faces the door (up) and stands still on arrival");
ok([0, 1, 2, 3].every((c) => seenCols.has(c)), "all four walk-cycle frames were shown");
ok(w.location().nodes.join() === "mainDoor", "location is the door node");

// 3) Already at the door: arrival fires synchronously, no animation frame needed.
let sync = 0;
w.walk(findRoute(w.location().pos, w.location().nodes, "mainDoor"), () => sync++);
ok(sync === 1 && queue.every((q) => q === null), "zero-length route resolves immediately");

// 4) Retarget mid-walk: head for the clock tower, switch to the small house after 1.2 s.
let clock = 0, monk = 0;
w.walk(findRoute(w.location().pos, w.location().nodes, "clockDoor"), () => clock++);
for (let i = 0; i < 75; i++) frame();
const mid = w.location();
ok(mid.nodes.length === 2, `two candidate nodes while on a segment (${mid.nodes})`);
const back = findRoute(mid.pos, mid.nodes, "monkDoor");
ok(back.map((p) => p.id).join(">") === "roadMain>start>monkDoor", `continues to the junction, then back along the road (${back.map((p) => p.id)})`);
const rows = new Set();
w.walk(back, () => monk++);
runUntil(() => { rows.add(row()); return monk === 1; });
ok(rows.has(0) && rows.has(2), "walked down to the junction, then left along the road");
ok(clock === 0, "the interrupted walk's callback never fired");
ok(dist(w.location().pos, NODES.monkDoor) === 0 && row() === 1, "arrived at the small house facing its door");

// 5) A tab that was hidden: one huge frame moves at most a tenth of a second's worth.
w.walk(findRoute(w.location().pos, w.location().nodes, "clockDoor"));
const before = w.location().pos;
frame(5000);
ok(dist(before, w.location().pos) <= 7.2 + 1e-9, "no teleporting after a long gap");

// 6) Graph sanity: every building's door is reachable from the start node.
for (const b of BUILDINGS) ok(findRoute(NODES.start, ["start"], b.door).length > 1, `${b.id} reachable`);

console.log(`walker: ${checks} checks passed`);
