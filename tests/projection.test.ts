import { describe, it, expect } from 'vitest';
import { project, projectMany } from '../src/projection.js';

describe('projection', () => {
  it('returns (0,0) for a point at the origin', () => {
    const p = project({ lon: -96.5, lat: 33.3 }, { lon: -96.5, lat: 33.3 });
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.z).toBeCloseTo(0, 6);
  });

  it('produces positive x for points east of origin', () => {
    const origin = { lon: 0, lat: 33 };
    const p = project({ lon: 0.001, lat: 33 }, origin);
    expect(p.x).toBeGreaterThan(0);
  });

  it('produces negative z for points north of origin', () => {
    const origin = { lon: 0, lat: 33 };
    const p = project({ lon: 0, lat: 33.001 }, origin);
    expect(p.z).toBeLessThan(0);
  });

  it('distance grows roughly with arc length at city scale', () => {
    const origin = { lon: 0, lat: 0 };
    const p1 = project({ lon: 0.009, lat: 0 }, origin);
    expect(p1.x).toBeGreaterThan(900);
    expect(p1.x).toBeLessThan(1100);
  });

  it('projectMany matches single-call project', () => {
    const origin = { lon: -96.5, lat: 33.3 };
    const inputs = [
      { lon: -96.5, lat: 33.3 },
      { lon: -96.499, lat: 33.301 },
      { lon: -96.501, lat: 33.299 },
    ];
    const many = projectMany(inputs, origin);
    for (let i = 0; i < inputs.length; i++) {
      const single = project(inputs[i]!, origin);
      expect(many[i]!.x).toBeCloseTo(single.x, 6);
      expect(many[i]!.z).toBeCloseTo(single.z, 6);
    }
  });
});
