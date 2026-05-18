import * as THREE from 'three';
import type { Road, LonLat } from './types.js';
import { projectMany } from './projection.js';

const ROAD_COLOR_BY_TYPE: Record<string, number> = {
  motorway: 0x404040,
  trunk: 0x404040,
  primary: 0x4a4a4a,
  secondary: 0x525252,
  tertiary: 0x5a5a5a,
  residential: 0x666666,
  service: 0x707070,
  pedestrian: 0x8a8a8a,
  footway: 0x8a8a8a,
  cycleway: 0x7a8a6a,
  path: 0x8a7a6a,
};

/**
 * Build a flat ribbon along a road path, width perpendicular to each segment.
 * Returns null if the path is degenerate.
 */
export function roadMesh(road: Road, origin: LonLat): THREE.Mesh | null {
  const path = projectMany(road.path, origin);
  if (path.length < 2) return null;

  const halfW = road.width / 2;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < path.length; i++) {
    const cur = path[i]!;
    const prev = i === 0 ? cur : path[i - 1]!;
    const next = i === path.length - 1 ? cur : path[i + 1]!;
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;

    positions.push(cur.x + nx * halfW, 0.05, cur.z + nz * halfW);
    positions.push(cur.x - nx * halfW, 0.05, cur.z - nz * halfW);
  }

  for (let i = 0; i < path.length - 1; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2);
    indices.push(a + 1, a + 3, a + 2);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const color = ROAD_COLOR_BY_TYPE[road.type] ?? 0x666666;
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.receiveShadow = true;
  mesh.userData = { osmId: road.id, kind: 'road', type: road.type };
  return mesh;
}

export function roadsGroup(roads: Road[], origin: LonLat): THREE.Group {
  const group = new THREE.Group();
  group.name = 'roads';
  for (const r of roads) {
    const m = roadMesh(r, origin);
    if (m) group.add(m);
  }
  return group;
}
