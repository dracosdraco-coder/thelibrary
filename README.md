# The Library

Scroll-driven 3D portfolio site. Walk up to a door, enter an isometric library, navigate via ambient nodes.

## Stack
- **Three.js r128** — 3D scene, cameras, lighting
- **Vanilla JS** — no framework, no bundler required
- **CSS** — UI overlays, cursor, typography
- **Fonts** — Cormorant Garamond + Cormorant SC (Google Fonts)

## Project Structure

```
the-library/
├── index.html              ← entry point
├── src/
│   ├── config.js           ← ALL tunable values (speeds, colours, distances)
│   ├── helpers.js          ← shared utility functions (mkMat etc.)
│   ├── input.js            ← wheel/touch scroll + cursor
│   ├── main.js             ← renderer, cameras, animate loop
│   └── scene/
│       ├── exterior.js     ← arch, door, path, lanterns, fog
│       ├── interior.js     ← room, bookshelves, chairs, lighting, dust
│       └── nodes.js        ← interactive amber hotspots
└── public/
    └── assets/
        ├── models/         ← drop .glb files here
        └── fonts/          ← local font files (optional)
```

## Running Locally

No build step required. Just serve from a local server (required for module loading):

```bash
# Option 1 — VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# Option 2 — Python
python3 -m http.server 8080

# Option 3 — Node
npx serve .
```

Then open `http://localhost:8080`

> **Note:** Opening `index.html` directly via `file://` will work in most browsers but some block local script imports. Use a local server to be safe.

## Tuning the Experience

All values are in `src/config.js`:

| Key | What it controls |
|-----|-----------------|
| `WHEEL_SPEED` | How fast scrolling moves you through the scene |
| `LERP_SPEED` | Camera smoothing (lower = floatier) |
| `P_SWITCH` | Progress point where walk-up ends and iso begins |
| `CAM_START_Z` | How far back the camera starts |
| `BOB_MAX` | Max head-bob amplitude while walking |
| `ISO_HALF` | Isometric zoom level (lower = more zoomed in) |
| `ISO_DIST` | Isometric camera distance from origin |

## Adding a Blender Model

1. Export your scene from Blender as `.glb` (File → Export → glTF 2.0)
2. Drop the file in `public/assets/models/`
3. Uncomment the GLTFLoader script tag in `index.html`
4. In `src/scene/interior.js`, replace the box geometry section with:

```js
const loader = new THREE.GLTFLoader();
loader.load('public/assets/models/library.glb', gltf => {
  intGroup.add(gltf.scene);
});
```

5. Do the same in `exterior.js` for the arch model

## Adding Nodes

Edit the `NODE_DATA` array in `src/scene/nodes.js`:

```js
{ pos: [x, y, z], label: 'Room Name', href: '#room-id' }
```

## Deploying to Vercel

Push to GitHub, connect repo in Vercel dashboard. No build command needed — set output directory to `/` (root).
