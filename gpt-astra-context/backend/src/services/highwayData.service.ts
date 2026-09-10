import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { HighwayCache } from '../modules/highways/highwayCache.model.js';
import { Corridor } from '../modules/corridors/corridor.model.js';
import { logger } from '../utils/logger.js';

const NH44: number[][] = [
  [77.209, 28.6139],
  [77.3, 28.4],
  [77.4, 28.0],
  [77.58, 27.5],
  [77.973, 27.1767],
];

export async function syncHighways(): Promise<{ synced: number; source: string }> {
  const url = env.OVERPASS_API_URL;
  if (url) {
    try {
      const query = `[out:json][timeout:25];way["ref"="NH44"]["highway"](27.0,76.8,29.0,78.0);out geom;`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as {
        elements?: { geometry?: { lon: number; lat: number }[]; tags?: { name?: string } }[];
      };
      const way = json.elements?.find((e) => e.geometry && e.geometry.length > 1);
      if (way?.geometry) {
        const coordinates = way.geometry.map((g) => [g.lon, g.lat]);
        await HighwayCache.findOneAndUpdate(
          { ref: 'NH-44' },
          {
            ref: 'NH-44',
            name: way.tags?.name ?? 'NH-44',
            geometry: { type: 'LineString', coordinates },
            source: 'osm',
            syncedAt: new Date(),
          },
          { upsert: true },
        );
        await Corridor.updateMany(
          { highwayRef: 'NH-44', isDeleted: false },
          { path: { type: 'LineString', coordinates } },
        );
        return { synced: 1, source: 'osm' };
      }
    } catch (err) {
      logger.warn('Overpass sync failed, using cache', { err });
      const cached = await HighwayCache.countDocuments();
      if (cached > 0) throw new AppError(503, 'HIGHWAY_DATA_UNAVAILABLE', 'Highway geometry source unreachable');
    }
  }

  await HighwayCache.findOneAndUpdate(
    { ref: 'NH-44' },
    {
      ref: 'NH-44',
      name: 'NH-44 Delhi–Agra (seed)',
      geometry: { type: 'LineString', coordinates: NH44 },
      source: 'seed',
      syncedAt: new Date(),
    },
    { upsert: true },
  );
  return { synced: 1, source: 'seed' };
}
