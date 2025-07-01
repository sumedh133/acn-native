import * as turf from "@turf/turf";
import { Places } from "../types";

import rawGeojson from "../../assets/merged.json";
import { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";

const geojson = rawGeojson as FeatureCollection;

/**
 * Find the micromarket based on a lat/lng point and GeoJSON data
 * @param selectedPlace - Object with lat and lng coordinates
 * @returns Micromarket name or null if not found
 */
export function getMicromarketFromCoordinates(
  selectedPlace: Places
): [string | null, string | null] {
  if (!selectedPlace.lng || !selectedPlace.lat) {
    return [null, null];
  }

  const point = turf.point([selectedPlace.lng || 0, selectedPlace.lat || 0]);

  for (const feature of geojson.features) {
    if (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    ) {
      if (
        turf.booleanPointInPolygon(
          point,
          feature as Feature<Polygon | MultiPolygon>
        )
      ) {
        const micromarket = feature.properties?.Micromarket;
        return [
          micromarket || null,
          `${feature.properties?.Zone} Bangalore` || null,
        ];
      }
    }
  }

  return [null, null];
}
