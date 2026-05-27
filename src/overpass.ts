import type { BoundingBox, OverpassResponse, OsmElement, OsmNode, OsmWay, Building, Road, Scene, LonLat } from './types.js';

const DEFAULT_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const DEFAULT_USER_AGENT = '@mnemopay/map3d (+https://github.com/mnemopay/mnemopay-map3d; info@getbizsuite.com)';

export interface FetchOptions {
  endpoint?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Attribution sent by Node-based bake tools when contacting Overpass. */
  userAgent?: string;
}

export function buildingsAndRoadsQuery(bbox: BoundingBox): string {
  const { south, west, north, east } = bbox;
  const b = `(${south},${west},${north},${east})`;
  return `[out:json][timeout:25];
(
  way["building"]${b};
  way["highway"]${b};
);
out body;
>;
out skel qt;`;
}

export async function fetchOverpass(
  query: string,
  opts: FetchOptions = {}
): Promise<OverpassResponse> {
  const endpoint = opts.endpoint ?? DEFAULT_ENDPOINT;
  const ctl = new AbortController();
  const timer = opts.timeoutMs
    ? setTimeout(() => ctl.abort(new Error('overpass timeout')), opts.timeoutMs)
    : null;
  const sig = opts.signal ?? ctl.signal;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': opts.userAgent ?? DEFAULT_USER_AGENT,
      },
      body: new URLSearchParams({ data: query }).toString(),
      signal: sig,
    });
    if (!res.ok) {
      throw new Error(`overpass ${res.status}: ${await res.text().catch(() => '')}`);
    }
    const json = (await res.json()) as OverpassResponse;
    return json;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const DEFAULT_LEVEL_HEIGHT_METERS = 3.2;

function parseHeightMeters(tags: Record<string, string> | undefined): { height: number; levels: number } {
  if (!tags) return { height: DEFAULT_LEVEL_HEIGHT_METERS, levels: 1 };

  const heightStr = tags['height'] ?? tags['building:height'];
  if (heightStr) {
    const n = Number(heightStr.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n > 0) {
      const levels = Math.max(1, Math.round(n / DEFAULT_LEVEL_HEIGHT_METERS));
      return { height: n, levels };
    }
  }

  const levelsStr = tags['building:levels'] ?? tags['levels'];
  if (levelsStr) {
    const n = Number(levelsStr);
    if (Number.isFinite(n) && n > 0) {
      return { height: n * DEFAULT_LEVEL_HEIGHT_METERS, levels: Math.round(n) };
    }
  }

  return { height: DEFAULT_LEVEL_HEIGHT_METERS, levels: 1 };
}

const HIGHWAY_WIDTHS_METERS: Record<string, number> = {
  motorway: 12,
  trunk: 11,
  primary: 10,
  secondary: 8,
  tertiary: 7,
  unclassified: 6,
  residential: 6,
  service: 4,
  pedestrian: 3,
  footway: 2,
  cycleway: 2,
  path: 1.5,
};

function roadWidth(tags: Record<string, string> | undefined): number {
  const type = tags?.['highway'] ?? 'residential';
  return HIGHWAY_WIDTHS_METERS[type] ?? 5;
}

export function elementsToScene(elements: OsmElement[], bbox: BoundingBox): Scene {
  const nodes = new Map<number, OsmNode>();
  const ways: OsmWay[] = [];
  for (const e of elements) {
    if (e.type === 'node') nodes.set(e.id, e);
    else if (e.type === 'way') ways.push(e);
  }

  const buildings: Building[] = [];
  const roads: Road[] = [];

  for (const w of ways) {
    const tags = w.tags ?? {};
    const path: LonLat[] = [];
    for (const nid of w.nodes) {
      const n = nodes.get(nid);
      if (n) path.push({ lon: n.lon, lat: n.lat });
    }
    if (path.length < 2) continue;

    if (tags['building']) {
      const { height, levels } = parseHeightMeters(tags);
      buildings.push({
        id: w.id,
        footprint: path,
        height,
        levels,
        tags,
      });
    } else if (tags['highway']) {
      roads.push({
        id: w.id,
        path,
        width: roadWidth(tags),
        type: tags['highway'] ?? 'residential',
        tags,
      });
    }
  }

  const origin: LonLat = {
    lon: (bbox.west + bbox.east) / 2,
    lat: (bbox.south + bbox.north) / 2,
  };

  return { origin, bbox, buildings, roads };
}

export async function fetchScene(bbox: BoundingBox, opts: FetchOptions = {}): Promise<Scene> {
  const query = buildingsAndRoadsQuery(bbox);
  const res = await fetchOverpass(query, opts);
  return elementsToScene(res.elements, bbox);
}
