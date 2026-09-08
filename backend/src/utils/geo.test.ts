import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm, point } from './geo.js';

describe('geo', () => {
  it('returns a GeoJSON point', () => {
    assert.deepEqual(point(77.2, 28.6), { type: 'Point', coordinates: [77.2, 28.6] });
  });

  it('computes a positive Delhi–Agra distance', () => {
    const km = haversineKm([77.209, 28.6139], [78.008, 27.1767]);
    assert.ok(km > 100 && km < 300);
  });
});
