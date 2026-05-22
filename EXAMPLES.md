# Consuming integrations — `mnemopay-map3d`

`mnemopay-map3d` turns OpenStreetMap data into ready-to-render React Three Fiber scenes (`.glb`-exportable). Public, Apache-2.0.

The first-class use case is **3D visualization of any agent / merchant / charter / location data MnemoPay ingests** — Agent Credit Score distribution on a city map, GridStamp proof-of-presence pins on a delivery route, fleet visualization for ride-hailing agents, etc.

## Live first-party consumers

### 1. Dele driver coverage map (private)

`dele/web` will use `mnemopay-map3d` to render a 3D coverage map of Lagos showing active driver positions + recent passenger pickup pins. Same data already flows through Dele's existing 2D Leaflet view — the 3D layer is just a presentation pivot.

Status: scoped, not built. Adding to Dele's Q3 roadmap.

### 2. Agent FICO score 3D visualization (in scope)

mnemopay.com/score (planned) — interactive 3D bar chart of agent credit score distribution across the population of agents on the protocol. Each bar = a 25-point score bucket, height = agent count, color = mean payment-history score.

Status: scoped after first 100 agents are scored (currently <10).

## Planned consumers

### 3. Praetor proof-of-presence "where did the drone go" map

Praetor's drone-delivery proof-of-presence flow logs GPS pings as Merkle-anchored audit events. `mnemopay-map3d` renders the flight path in 3D over OSM terrain for the final delivery receipt — visually-verifiable proof.

### 4. GridStamp audit anchor visualization

GridStamp anchors audit roots to Bitcoin / Ethereum at regular intervals. `mnemopay-map3d` could render a "physical location of anchoring node" view — provenance is geographic too.

## How to add your own

```bash
npm i mnemopay-map3d
```

```ts
import { Map3D, OSMSource } from "mnemopay-map3d";

// Render Lagos in 3D
<Map3D
  source={new OSMSource({ bbox: [3.30, 6.50, 3.45, 6.60] })}
  layers={[
    { type: "buildings", color: "#888" },
    { type: "roads", color: "#fff", width: 1.5 },
    { type: "points", data: driverPositions, color: "#68e0b8" },
  ]}
/>

// Or export to .glb for any Three.js scene
const glb = await Map3D.export({ source, layers });
```

## Repo

- npm: `mnemopay-map3d` (Apache-2.0, public)
- Source: `github.com/mnemopay/mnemopay-map3d` (public)
- License: Apache-2.0
