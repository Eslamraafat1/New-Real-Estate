"use client";

import { DemoSvgMap, type MapMarker, type MapViewProps } from "./DemoSvgMap";

export type { MapMarker, MapViewProps };

/**
 * Map provider boundary. Pages and explorers import <MapView/> only.
 *
 * Providers:
 *  - "demo" (default): illustrative SVG map of a fictional city, no API key needed.
 *  - "mapbox" / "maplibre": NOT implemented. Wire them here (markers need `lat`/`lng` from the
 *    backend — see docs/BACKEND_INTEGRATION.md) and keep the same MapViewProps contract.
 * Until a provider is implemented AND configured, the demo map is always used.
 */
export function MapView(props: MapViewProps) {
  return <DemoSvgMap {...props} />;
}
