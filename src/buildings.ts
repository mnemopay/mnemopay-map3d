import * as THREE from 'three';
import type { Building, LonLat } from './types.js';
import { projectMany } from './projection.js';

export interface BuildingMeshOptions {
  origin: LonLat;
  color?: number;
  roofColor?: number;
  merged?: boolean;
}

/**
 * Extrude a building footprint to a Three.js mesh.
 * Returns null if the footprint is degenerate.
 */
export function buildingMesh(b: Building, origin: LonLat, color = 0xc8c5be): THREE.Mesh | null {
  const ring = projectMany(b.footprint, origin);
  if (ring.length < 3) return null;

  const shape = new THREE.Shape();
  shape.moveTo(ring[0]!.x, ring[0]!.z);
  for (let i = 1; i < ring.length; i++) {
    shape.lineTo(ring[i]!.x, ring[i]!.z);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: b.height,
    bevelEnabled: false,
    steps: 1,
  });
  geom.rotateX(-Math.PI / 2);
  geom.computeBoundingBox();
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { osmId: b.id, kind: 'building', height: b.height, levels: b.levels };
  return mesh;
}

/**
 * Build a Three.js Group containing all building meshes in the scene.
 * Pass merged=true to combine geometries into one mesh (one draw call).
 */
export function buildingsGroup(
  buildings: Building[],
  opts: BuildingMeshOptions
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'buildings';
  const color = opts.color ?? 0xc8c5be;
  for (const b of buildings) {
    const m = buildingMesh(b, opts.origin, color);
    if (m) group.add(m);
  }
  return group;
}
