// Hotel Elite Inn - Geofencing & Network Transition Security Engine
// Property: Opposite Railway Station Main Road, Muniguda, Rayagada (Odisha) - 765020

export const HOTEL_GEOFENCE_CONFIG = {
  property: "Hotel Elite Inn",
  address: "Opposite Railway Station Main Road, Muniguda, Rayagada, Odisha 765020",
  // Accurate coordinates for Muniguda Railway Station / Hotel Elite Inn property
  latitude: 19.6267,
  longitude: 83.4917,
  radiusMeters: 250, // 250-meter perimeter covers all hotel blocks, kitchen, dining and parking
  wifiSsids: ["TP 1ST FLOOR", "TP 2ND FLOOR", "TP 3RD FLOOR"]
};

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Verifies if user device is inside Hotel Elite Inn boundary via Browser Geolocation API
 */
export function verifyHotelGeofence(timeoutMs = 10000) {
  return new Promise((resolve) => {
    // Check if bypass key is set in localStorage (e.g., manager test override)
    try {
      const bypass = localStorage.getItem('hei_geofence_bypass');
      if (bypass === 'true') {
        resolve({
          isInside: true,
          distanceMeters: 0,
          coords: { latitude: HOTEL_GEOFENCE_CONFIG.latitude, longitude: HOTEL_GEOFENCE_CONFIG.longitude },
          bypassed: true,
          error: null
        });
        return;
      }
    } catch {}

    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({
        isInside: false,
        distanceMeters: null,
        coords: null,
        error: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const dist = calculateHaversineDistanceMeters(
          latitude,
          longitude,
          HOTEL_GEOFENCE_CONFIG.latitude,
          HOTEL_GEOFENCE_CONFIG.longitude
        );

        // Account for GPS inaccuracy tolerance (max 50m)
        const isInside = dist <= (HOTEL_GEOFENCE_CONFIG.radiusMeters + Math.min(accuracy, 50));
        resolve({
          isInside,
          distanceMeters: dist,
          accuracy: Math.round(accuracy),
          coords: { latitude, longitude },
          bypassed: false,
          error: isInside ? null : `Device is ${dist}m away from Hotel Elite Inn (Perimeter: ${HOTEL_GEOFENCE_CONFIG.radiusMeters}m).`
        });
      },
      (err) => {
        let errMsg = 'Unable to acquire location.';
        if (err.code === 1) errMsg = 'Location permission denied. Please allow location access to verify hotel boundary.';
        else if (err.code === 2) errMsg = 'GPS signal unavailable. Please enable high accuracy location.';
        else if (err.code === 3) errMsg = 'Location request timed out.';
        
        resolve({
          isInside: false,
          distanceMeters: null,
          coords: null,
          error: errMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 15000
      }
    );
  });
}

/**
 * Monitors network switching between Wi-Fi and Cellular mobile data.
 * Whenever network connection transitions, triggers location re-verification.
 */
export function watchNetworkTransitionGeofence(onTransitionCallback) {
  if (typeof window === 'undefined') return () => {};

  const handleNetworkChange = async () => {
    const conn = navigator.connection;
    const netType = conn ? (conn.type || conn.effectiveType || 'cellular') : 'cellular/wifi';
    
    // Perform geofence verification immediately on network switch
    const geofenceResult = await verifyHotelGeofence();
    if (onTransitionCallback) {
      onTransitionCallback({
        event: 'network_switch',
        networkType: netType,
        timestamp: new Date().toISOString(),
        ...geofenceResult
      });
    }
  };

  // 1. NetworkInformation API (Chromium / Android mobile browsers)
  if (navigator.connection) {
    navigator.connection.addEventListener('change', handleNetworkChange);
  }

  // 2. Standard online event (fires when switching connections)
  window.addEventListener('online', handleNetworkChange);

  return () => {
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', handleNetworkChange);
    }
    window.removeEventListener('online', handleNetworkChange);
  };
}
