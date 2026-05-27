// R3F's <primitive> JSX element isn't in the base React JSX.IntrinsicElements
// list. Augment it here so tsc -p tsconfig.build.json accepts the usage in
// react.tsx without pulling in the full @react-three/fiber type surface
// (which is an optional peer dep).
import type { Object3D } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: {
        object: Object3D;
        [key: string]: unknown;
      };
    }
  }
}

export {};
