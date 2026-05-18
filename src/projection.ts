import type { LonLat } from './types.js';

const EARTH_RADIUS_METERS = 6_378_137;
const DEG2RAD = Math.PI / 180;

/**
 * Equirectangular projection of (lon,lat) → (x,z) meters relative to origin.
 * Adequate for city-scale (~5km bbox) where the projection distortion stays under 0.1%.
 * For wider areas use a real Web Mercator or UTM zone.
 */
export function project(point: LonLat, origin: LonLat): { x: number; z: number } {
  const dLon = (point.lon - origin.lon) * DEG2RAD;
  const dLat = (point.lat - origin.lat) * DEG2RAD;
  const x = dLon * EARTH_RADIUS_METERS * Math.cos(origin.lat * DEG2RAD);
  const z = -dLat * EARTH_RADIUS_METERS;
  return { x, z };
}

export function projectMany(points: LonLat[], origin: LonLat): Array<{ x: number; z: number }> {
  return points.map((p) => project(p, origin));
}
