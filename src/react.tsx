import { useEffect, useMemo, useState } from 'react';
import type { BoundingBox, Scene } from './types.js';
import { fetchScene } from './overpass.js';
import { buildSceneRoot, type SceneRootOptions } from './sceneRoot.js';

export interface Map3DProps extends SceneRootOptions {
  bbox: BoundingBox;
  endpoint?: string;
  onSceneLoad?: (scene: Scene) => void;
  onError?: (err: Error) => void;
}

/**
 * React-Three-Fiber component. Renders a 3D city from an OSM bbox.
 * Drop inside <Canvas> from @react-three/fiber.
 *
 * @example
 *   <Canvas camera={{ position: [0, 400, 600], fov: 50 }}>
 *     <ambientLight intensity={0.5} />
 *     <directionalLight position={[400, 800, 400]} intensity={1} castShadow />
 *     <Map3D bbox={{ south: 6.43, west: 3.40, north: 6.44, east: 3.41 }} />
 *   </Canvas>
 */
export function Map3D(props: Map3DProps) {
  const [scene, setScene] = useState<Scene | null>(null);

  useEffect(() => {
    let active = true;
    fetchScene(props.bbox, { endpoint: props.endpoint })
      .then((s) => {
        if (!active) return;
        setScene(s);
        props.onSceneLoad?.(s);
      })
      .catch((err: Error) => {
        if (!active) return;
        props.onError?.(err);
      });
    return () => {
      active = false;
    };
  }, [props.bbox.south, props.bbox.west, props.bbox.north, props.bbox.east, props.endpoint]);

  const root = useMemo(() => {
    if (!scene) return null;
    return buildSceneRoot(scene, {
      groundColor: props.groundColor,
      buildingColor: props.buildingColor,
      groundRadius: props.groundRadius,
    });
  }, [scene, props.groundColor, props.buildingColor, props.groundRadius]);

  if (!root) return null;
  return <primitive object={root} />;
}
