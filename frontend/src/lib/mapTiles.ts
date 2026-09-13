import { env } from '@/lib/env';

type LeafletTileConfig = {
  url: string;
  options: {
    maxZoom: number;
    tileSize?: number;
    zoomOffset?: number;
    subdomains?: string;
    attribution: string;
  };
};

function publicMapKey(): string {
  const raw = env.NEXT_PUBLIC_MAP_API_KEY?.trim() || env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || '';
  if (!raw || raw.startsWith('your_')) return '';
  return raw;
}

/**
 * Browser-safe Leaflet raster config. The public token is only used in the
 * tile URL required by the provider — never log or display it.
 */
export function getLeafletTileConfig(): LeafletTileConfig {
  const key = publicMapKey();

  if (key.startsWith('pk.')) {
    return {
      url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=' + encodeURIComponent(key),
      options: {
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        attribution: '',
      },
    };
  }

  if (key) {
    return {
      url: 'https://apis.mappls.com/advancedmaps/v1/' + encodeURIComponent(key) + '/still/{z}/{x}/{y}',
      options: {
        maxZoom: 18,
        attribution: '',
      },
    };
  }

  return {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '',
    },
  };
}
