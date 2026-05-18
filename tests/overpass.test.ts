import { describe, it, expect } from 'vitest';
import { buildingsAndRoadsQuery, elementsToScene } from '../src/overpass.js';
import type { OsmElement } from '../src/types.js';

describe('buildingsAndRoadsQuery', () => {
  it('includes the bbox tuple in the correct (S,W,N,E) order', () => {
    const q = buildingsAndRoadsQuery({ south: 1, west: 2, north: 3, east: 4 });
    expect(q).toContain('(1,2,3,4)');
    expect(q).toContain('building');
    expect(q).toContain('highway');
  });
});

describe('elementsToScene', () => {
  const bbox = { south: 0, west: 0, north: 1, east: 1 };

  it('classifies buildings vs roads by tag', () => {
    const elements: OsmElement[] = [
      { type: 'node', id: 1, lon: 0.1, lat: 0.1 },
      { type: 'node', id: 2, lon: 0.2, lat: 0.1 },
      { type: 'node', id: 3, lon: 0.2, lat: 0.2 },
      { type: 'node', id: 4, lon: 0.1, lat: 0.2 },
      { type: 'way', id: 100, nodes: [1, 2, 3, 4, 1], tags: { building: 'yes', 'building:levels': '5' } },
      { type: 'way', id: 200, nodes: [1, 2, 3], tags: { highway: 'residential' } },
    ];
    const scene = elementsToScene(elements, bbox);
    expect(scene.buildings).toHaveLength(1);
    expect(scene.roads).toHaveLength(1);
    expect(scene.buildings[0]!.levels).toBe(5);
    expect(scene.buildings[0]!.height).toBeCloseTo(16, 0);
  });

  it('skips ways with fewer than 2 nodes', () => {
    const elements: OsmElement[] = [
      { type: 'node', id: 1, lon: 0.1, lat: 0.1 },
      { type: 'way', id: 100, nodes: [1], tags: { building: 'yes' } },
    ];
    const scene = elementsToScene(elements, bbox);
    expect(scene.buildings).toHaveLength(0);
  });

  it('parses explicit height tag and overrides levels', () => {
    const elements: OsmElement[] = [
      { type: 'node', id: 1, lon: 0, lat: 0 },
      { type: 'node', id: 2, lon: 0.001, lat: 0 },
      { type: 'node', id: 3, lon: 0.001, lat: 0.001 },
      { type: 'way', id: 100, nodes: [1, 2, 3, 1], tags: { building: 'yes', height: '42 m' } },
    ];
    const scene = elementsToScene(elements, bbox);
    expect(scene.buildings[0]!.height).toBe(42);
  });

  it('falls back to default height when no tags present', () => {
    const elements: OsmElement[] = [
      { type: 'node', id: 1, lon: 0, lat: 0 },
      { type: 'node', id: 2, lon: 0.001, lat: 0 },
      { type: 'node', id: 3, lon: 0.001, lat: 0.001 },
      { type: 'way', id: 100, nodes: [1, 2, 3, 1], tags: { building: 'yes' } },
    ];
    const scene = elementsToScene(elements, bbox);
    expect(scene.buildings[0]!.height).toBeGreaterThan(0);
    expect(scene.buildings[0]!.levels).toBeGreaterThanOrEqual(1);
  });

  it('assigns road width based on highway class', () => {
    const elements: OsmElement[] = [
      { type: 'node', id: 1, lon: 0, lat: 0 },
      { type: 'node', id: 2, lon: 0.001, lat: 0.001 },
      { type: 'way', id: 100, nodes: [1, 2], tags: { highway: 'motorway' } },
      { type: 'way', id: 200, nodes: [1, 2], tags: { highway: 'footway' } },
    ];
    const scene = elementsToScene(elements, bbox);
    const motorway = scene.roads.find((r) => r.type === 'motorway');
    const footway = scene.roads.find((r) => r.type === 'footway');
    expect(motorway!.width).toBeGreaterThan(footway!.width);
  });

  it('computes origin as the bbox center', () => {
    const scene = elementsToScene([], { south: 10, west: 20, north: 30, east: 40 });
    expect(scene.origin.lat).toBe(20);
    expect(scene.origin.lon).toBe(30);
  });
});
