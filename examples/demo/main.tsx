import { StrictMode, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Map3D } from '../../src/react.js';
import { exportGlb, downloadGlb } from '../../src/exporter.js';
import type { BoundingBox, Scene } from '../../src/types.js';

const CITIES: Record<string, { name: string; bbox: BoundingBox }> = {
  lagos: { name: 'Lagos Island', bbox: { south: 6.448, west: 3.392, north: 6.460, east: 3.408 } },
  melissa: { name: 'Melissa TX', bbox: { south: 33.281, west: -96.580, north: 33.295, east: -96.560 } },
  manhattan: { name: 'Lower Manhattan', bbox: { south: 40.705, west: -74.015, north: 40.720, east: -73.998 } },
  london: { name: 'City of London', bbox: { south: 51.510, west: -0.095, north: 51.520, east: -0.080 } },
};

function App() {
  const [cityKey, setCityKey] = useState<keyof typeof CITIES>('lagos');
  const [scene, setScene] = useState<Scene | null>(null);
  const rootRef = useRef<THREE.Group | null>(null);
  const city = CITIES[cityKey]!;

  return (
    <>
      <div className="panel">
        <h1>@mnemopay/map3d demo</h1>
        <div>
          <select value={cityKey} onChange={(e) => setCityKey(e.target.value as keyof typeof CITIES)}>
            {Object.entries(CITIES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          <button
            disabled={!scene}
            onClick={async () => {
              if (!rootRef.current) return;
              const buf = await exportGlb(rootRef.current);
              downloadGlb(buf, `${cityKey}.glb`);
            }}
          >
            Export GLB
          </button>
        </div>
        <small>
          {scene
            ? `${scene.buildings.length} buildings · ${scene.roads.length} roads · OSM Overpass`
            : 'Loading OpenStreetMap data…'}
        </small>
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 600, 800], fov: 50, near: 1, far: 10_000 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#05070e']} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[400, 1200, 400]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-1500}
          shadow-camera-right={1500}
          shadow-camera-top={1500}
          shadow-camera-bottom={-1500}
        />
        <group ref={rootRef as never}>
          <Map3D
            bbox={city.bbox}
            onSceneLoad={setScene}
            onError={(e) => console.error(e)}
          />
        </group>
      </Canvas>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
