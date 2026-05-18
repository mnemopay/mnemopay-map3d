import * as THREE from 'three';
import type { Scene } from './types.js';
import { buildingsGroup } from './buildings.js';
import { roadsGroup } from './roads.js';

export interface SceneRootOptions {
  groundColor?: number;
  buildingColor?: number;
  groundRadius?: number;
}

/**
 * Build a Three.js Group containing everything for a city scene:
 * ground plane, roads, buildings. Use this as the root for rendering
 * or pass to exportGlb() to write a GLB file.
 */
export function buildSceneRoot(scene: Scene, opts: SceneRootOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'map3d-scene';

  const groundRadius = opts.groundRadius ?? 2_500;
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(groundRadius, 64),
    new THREE.MeshStandardMaterial({
      color: opts.groundColor ?? 0x2a2f24,
      roughness: 1,
      metalness: 0,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  root.add(ground);

  root.add(roadsGroup(scene.roads, scene.origin));
  root.add(buildingsGroup(scene.buildings, { origin: scene.origin, color: opts.buildingColor }));

  return root;
}
