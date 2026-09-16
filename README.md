# Hadey Town

My personal website, built like a tiny top-down game. Click a building (or use the
buttons in the header) and the character walks over and opens it:

- **About Me** — the big house
- **Projects** — the small house by the road
- **Resume** — the clock tower

Live site: https://bigchaka02.github.io/HadeyTownWebsiteProject/
(direct links work too: `/#about`, `/#projects`, `/#resume`)

## Running it locally

```bash
npm install
npm run dev       # http://localhost:5173/HadeyTownWebsiteProject/
npm test          # walking-logic checks (no browser needed)
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Where things live

| File | What it is |
| --- | --- |
| `src/content.tsx` | Everything written on the pages: bio, projects, experience, skills, contact links. Edit this to update the site. |
| `src/town.ts` | Everything that is *in* the town: the map, the ambient animations (smoke, trees, bird, cat), the buildings (clickable areas, name signs, sprites) and the road network the character walks on. Coordinates are Tiled world pixels of `ExteriorMap.png`. |
| `src/components/Scene.tsx` | Renders the town and drives the character to whichever building was picked. |
| `src/walker.ts` | The walking logic: follows a route node to node, animates the sprite, and reports where the character is. |
| `src/components/Character.tsx` | The character's sprite element (the walker drives it). |
| `src/components/Dialog.tsx` | The RPG-style window a page opens in. |
| `src/assets/character.png` | The character sprite sheet — 18×32 frames; each row is a facing (down, up, left, right), each column a walk-cycle frame (stand, step, stand, other step). |

## Adding a building

1. Drop its image in `src/assets/…` and add an entry to `BUILDINGS` in `src/town.ts`
   (position, clickable `hitbox`, `sign` position and which `door` node to walk to).
2. Add the door as a node in `NODES` and connect it to the road in `EDGES`.
3. Add the page's title and content to `PAGES` in `src/content.tsx`.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to GitHub Pages. The first time, enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Credits

Map and animation art from the "full house animation" tileset in `src/assets/`.
The character is Hadey's own sprite (the left-facing frames are mirrored from the
right-facing ones, and the down/up walk cycles were completed from the provided poses).
