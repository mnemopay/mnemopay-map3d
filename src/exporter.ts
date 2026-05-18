import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface GlbExportOptions {
  binary?: boolean;
  embedImages?: boolean;
  fileName?: string;
}

/**
 * Export a Three.js scene/object to a GLB ArrayBuffer (or JSON GLTF).
 * Resolves with the binary buffer; throws on serialization error.
 */
export function exportGlb(
  root: THREE.Object3D,
  opts: GlbExportOptions = {}
): Promise<ArrayBuffer> {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      root,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('expected binary GLB ArrayBuffer; got JSON GLTF (set binary:true)'));
        }
      },
      (err) => reject(err),
      {
        binary: opts.binary ?? true,
        embedImages: opts.embedImages ?? true,
        onlyVisible: true,
      }
    );
  });
}

/** Trigger a browser download of a GLB buffer. */
export function downloadGlb(buf: ArrayBuffer, fileName = 'scene.glb'): void {
  const blob = new Blob([buf], { type: 'model/gltf-binary' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
