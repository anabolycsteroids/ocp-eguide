export interface MapPlace {
  id: string;
  name: string;
  type: "FACILITY" | "BUILDING";
  category: string;
  identified: boolean;
  source: "satellite-label" | "satellite-visible" | "google-earth";
  gps?: { lat: number; lng: number; elevationM?: number };
  coordinateOrigin?: "google-earth" | "satellite-label";
  verified: boolean;
  aliases: string[];
  mapX?: number;
  mapY?: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
  x: number;
  y: number;
  description: string;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: "entrance" | "intersection";
  label: string;
}

export interface MapEdge {
  from: string;
  to: string;
  walkable: boolean;
}

export interface PlaceNodeConnection {
  placeId: string;
  nodeId: string;
  accessPoint: string;
  verified: boolean;
}

export interface MapConfig {
  version: string;
  campus: string;
  description: string;
  satellite: {
    images: { id: string; file: string; width: number; height: number; description: string }[];
  };
  coordinateSystem: {
    description: string;
    originX: number;
    originY: number;
    width: number;
    height: number;
    units: string;
    note: string;
  };
  calibration: {
    description: string;
    scaleFactor: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
  navigation: {
    walkingSpeed: number;
    walkingSpeedUnit: string;
    pixelsPerMeter: number;
    note: string;
  };
  display: {
    defaultZoom: number;
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
    labelMinZoom: number;
    buildingMarkerMinZoom: number;
    nodeMinZoom: number;
  };
}

export interface MapData {
  places: MapPlace[];
  nodes: MapNode[];
  edges: MapEdge[];
  connections: PlaceNodeConnection[];
  config: MapConfig;
}

export interface RoutePath {
  nodeId: string;
  x: number;
  y: number;
  label: string;
}

export interface RouteResult {
  path: RoutePath[];
  distM: number;
  timeS: number;
  distStr: string;
  timeStr: string;
  instructions: RouteInstruction[];
}

export interface RouteInstruction {
  text: string;
  nodeId: string;
}

export interface SearchResult {
  place: MapPlace;
  score: number;
}
