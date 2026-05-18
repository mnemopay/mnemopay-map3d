# @mnemopay/map3d

Browser-native 3D city map renderer. Pulls building footprints + road networks from OpenStreetMap, extrudes them in Three.js, exports GLB. Drop-in for React, R3F, or vanilla Three.

```
npm install @mnemopay/map3d three @react-three/fiber react
```

## Why this exists

`cartesiancs/map3d` (MIT, 1.5k★) demonstrated the pattern. We built our own because:

- We need it inside **Dele** (Lagos 3D ride preview), **Forge** (cityscape game levels), and the **MnemoPay native browser** (location-aware agent surfaces). Shared package = one source of truth.
- We need GLB export hooks for our content pipeline (TRELLIS-style asset generation).
- We need MIT/Apache-2.0 with a clean provenance chain — every dependency under permissive license, no GPL/AGPL surprises.
- We want a smaller, tree-shakeable surface — pure functions for projection/geometry, optional React layer.

## 30-second example

```tsx
import { Canvas } from '@react-three/fiber';
import { Map3D } from '@mnemopay/map3d/react';

<Canvas camera={{ position: [0, 600, 800], fov: 50 }}>
  <ambientLight intensity={0.4} />
  <directionalLight position={[400, 1200, 400]} intensity={1.2} castShadow />
  <Map3D bbox={{ south: 6.448, west: 3.392, north: 6.460, east: 3.408 }} />
</Canvas>
```

## Headless / Node / GLB-only

```ts
import { fetchScene } from '@mnemopay/map3d/overpass';
import { buildSceneRoot } from '@mnemopay/map3d';
import { exportGlb } from '@mnemopay/map3d/exporter';

const scene = await fetchScene({ south: 6.448, west: 3.392, north: 6.460, east: 3.408 });
const root = buildSceneRoot(scene);
const glb = await exportGlb(root);
```

## API surface

| Subpath | Exports |
|---|---|
| `@mnemopay/map3d` | `buildSceneRoot`, `project`, `projectMany`, types |
| `@mnemopay/map3d/overpass` | `fetchScene`, `fetchOverpass`, `elementsToScene`, `buildingsAndRoadsQuery` |
| `@mnemopay/map3d/buildings` | `buildingMesh`, `buildingsGroup` |
| `@mnemopay/map3d/roads` | `roadMesh`, `roadsGroup` |
| `@mnemopay/map3d/exporter` | `exportGlb`, `downloadGlb` |
| `@mnemopay/map3d/react` | `<Map3D />` |

## OSM data caveats

OpenStreetMap building heights are **incomplete**. We fall back, in order:
1. `height` or `building:height` tag (meters)
2. `building:levels` × 3.2 m
3. 3.2 m default (one-story)

Road widths are inferred from `highway` class. Footprints are extruded straight up; no roof shapes, no overhangs. For accurate heights, pair with a heightmap or commercial provider (Mapbox, Cesium, Google 3D Tiles).

## Demo

```
npm install
npm run demo
```

Opens `http://localhost:5180` with a Lagos / Manhattan / London / Melissa TX picker and a GLB export button.

## License

Apache-2.0 © J&B Enterprise LLC. OSM data © OpenStreetMap contributors, licensed under [ODbL](https://www.openstreetmap.org/copyright).
