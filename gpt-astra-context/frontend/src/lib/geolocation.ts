export interface GeolocationState {
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  error: string | null;
}

let watchId: number | null = null;

export function startGeolocation(
  onUpdate: (state: GeolocationState) => void,
  options?: { enableHighAccuracy?: boolean; interval?: number }
): void {
  if (!navigator.geolocation) {
    onUpdate({ error: 'Geolocation not supported' });
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        error: null,
      });
    },
    (err) => {
      onUpdate({ error: err.message });
    },
    {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      maximumAge: options?.interval ?? 30000,
      timeout: 15000,
    }
  );
}

export function stopGeolocation(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}
