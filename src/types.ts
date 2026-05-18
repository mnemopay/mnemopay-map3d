export interface LonLat {
  lon: number;
  lat: number;
}

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export type OsmTags = Record<string, string>;

export interface OsmNode {
  type: 'node';
  id: number;
  lon: number;
  lat: number;
  tags?: OsmTags;
}

export interface OsmWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags?: OsmTags;
}

export interface OsmRelation {
  type: 'relation';
  id: number;
  members: Array<{ type: string; ref: number; role: string }>;
  tags?: OsmTags;
}

export type OsmElement = OsmNode | OsmWay | OsmRelation;

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OsmElement[];
}

export interface Building {
  id: number;
  footprint: LonLat[];
  height: number;
  levels: number;
  tags: OsmTags;
}

export interface Road {
  id: number;
  path: LonLat[];
  width: number;
  type: string;
  tags: OsmTags;
}

export interface Scene {
  origin: LonLat;
  bbox: BoundingBox;
  buildings: Building[];
  roads: Road[];
}
