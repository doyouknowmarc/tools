export const SAMPLE_LOCATION_DATA = [
  {
    source: 'GPS',
    accuracy: 5.8,
    latitude: 37.773972,
    id: 'sample-1',
    timestamp: '2024-05-12T17:03:13Z',
    longitude: -122.431297,
  },
  {
    source: 'GPS',
    accuracy: 6.4,
    latitude: 37.775102,
    id: 'sample-2',
    timestamp: '2024-05-12T17:05:42Z',
    longitude: -122.428551,
  },
  {
    source: 'Wi-Fi',
    accuracy: 32.5,
    latitude: 37.772318,
    id: 'sample-3',
    timestamp: '2024-05-12T17:07:06Z',
    longitude: -122.434812,
  },
  {
    source: 'Wi-Fi',
    accuracy: 41.9,
    latitude: 37.774561,
    id: 'sample-4',
    timestamp: '2024-05-12T17:08:11Z',
    longitude: -122.437105,
  },
];

const LOCATION_LOOKUP_DELAY_MS = 200;
const STRATEGY_RETRY_DELAY_MS = 50;

const delay = (duration) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}

function createPopupMarkup(point, index, totalPoints, color) {
  return `<div style="font-family: system-ui, sans-serif;">
    <h4 style="margin: 0 0 10px 0; color: ${color}; font-size: 16px;">
      ${point.source} Location
    </h4>
    <p style="margin: 6px 0; font-size: 14px;"><strong>Time:</strong> ${formatTimestamp(
      point.timestamp
    )}</p>
    <p style="margin: 6px 0; font-size: 14px;"><strong>Accuracy:</strong> ±${point.accuracy.toFixed(
      1
    )}m</p>
    <p style="margin: 6px 0; font-size: 14px;"><strong>Coordinates:</strong><br />
      ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}</p>
    <p style="margin: 6px 0; font-size: 12px; color: #6b7280;">Point #${index + 1} of ${totalPoints}</p>
  </div>`;
}

function getPointColor(source) {
  if (source === 'GPS') {
    return '#ef4444';
  }

  if (source === 'Wi-Fi') {
    return '#3b82f6';
  }

  return '#6b7280';
}

function formatAddressFromData(data) {
  if (!data) {
    return '';
  }

  if (data.address) {
    const address = data.address;
    const segments = [];

    if (address.house_number && address.road) {
      segments.push(`${address.road} ${address.house_number}`);
    } else if (address.road) {
      segments.push(address.road);
    } else if (address.pedestrian) {
      segments.push(`${address.pedestrian} (pedestrian)`);
    } else if (address.footway) {
      segments.push(`${address.footway} (footway)`);
    } else if (address.path) {
      segments.push(`${address.path} (path)`);
    }

    if (address.neighbourhood) {
      segments.push(address.neighbourhood);
    } else if (address.suburb) {
      segments.push(address.suburb);
    } else if (address.residential) {
      segments.push(address.residential);
    }

    if (address.city_district) {
      segments.push(address.city_district);
    } else if (address.county) {
      segments.push(address.county);
    }

    if (address.city || address.town || address.village) {
      segments.push(address.city || address.town || address.village);
    }

    if (segments.length <= 1) {
      if (address.amenity) {
        segments.push(`Near ${address.amenity}`);
      }
      if (address.shop) {
        segments.push(`Near ${address.shop} shop`);
      }
      if (address.tourism) {
        segments.push(`Near ${address.tourism}`);
      }
      if (address.building) {
        segments.push(`Near ${address.building}`);
      }
    }

    if (segments.length) {
      return segments.join(', ');
    }
  }

  if (data.display_name) {
    const parts = data.display_name.split(', ').slice(0, 3);
    if (parts.length) {
      return parts.join(', ');
    }
  }

  return '';
}

async function fetchAddressPayload(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Lookup failed with status ${response.status}`);
  }

  return response.json();
}

async function resolveAddress(latitude, longitude) {
  const strategies = [
    {
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      type: 'reverse',
    },
    {
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      type: 'reverse',
    },
    {
      url: `https://nominatim.openstreetmap.org/search?format=json&lat=${latitude}&lon=${longitude}&limit=1&addressdetails=1&radius=100`,
      type: 'search',
    },
  ];

  for (const strategy of strategies) {
    try {
      const data = await fetchAddressPayload(strategy.url);

      if (strategy.type === 'search' && Array.isArray(data) && data.length > 0) {
        const formatted = formatAddressFromData(data[0]);
        if (formatted) {
          return `${formatted} (nearby)`;
        }
      }

      if (strategy.type === 'reverse' && data && !Array.isArray(data)) {
        const formatted = formatAddressFromData(data);
        if (formatted) {
          return formatted;
        }
      }
    } catch (error) {
      console.error('Address lookup failed', error);
    }

    await delay(STRATEGY_RETRY_DELAY_MS);
  }

  try {
    const data = await fetchAddressPayload(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`
    );

    if (data?.address) {
      const parts = [];
      if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
      if (data.address.suburb) parts.push(data.address.suburb);
      if (data.address.city_district) parts.push(data.address.city_district);
      if (data.address.city) parts.push(data.address.city);

      if (parts.length) {
        return `${parts.join(', ')} (general area)`;
      }
    }
  } catch (error) {
    console.error('Fallback address lookup failed', error);
  }

  return `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function createPointKey(point) {
  return `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
}

function normaliseLocationPoint(item, index) {
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Every item must include numeric latitude and longitude values.');
  }

  const accuracy = Number(item.accuracy);

  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : 10,
    source: item.source || 'Unknown',
    timestamp: item.timestamp || new Date().toISOString(),
    id: item.id || `point-${index + 1}`,
  };
}

export async function parseLocationDataFile(file) {
  const isJsonType =
    file?.type === 'application/json' || file?.name?.toLowerCase().endsWith('.json');

  if (!file || !isJsonType) {
    throw new Error('Please upload a JSON file.');
  }

  const contents = await file.text();
  const parsed = JSON.parse(contents);

  if (!Array.isArray(parsed)) {
    throw new Error('JSON file must contain an array of location objects.');
  }

  if (!parsed.length) {
    throw new Error('JSON file contains no location data.');
  }

  return parsed.map(normaliseLocationPoint);
}

export async function createLocationMap(container, locationData) {
  const [{ default: L }] = await Promise.all([
    import('leaflet'),
    import('leaflet/dist/leaflet.css'),
  ]);

  const centerLat =
    locationData.reduce((sum, point) => sum + point.latitude, 0) / locationData.length;
  const centerLng =
    locationData.reduce((sum, point) => sum + point.longitude, 0) / locationData.length;

  const map = L.map(container).setView([centerLat, centerLng], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  locationData.forEach((point, index) => {
    const color = getPointColor(point.source);

    L.circle([point.latitude, point.longitude], {
      radius: point.accuracy,
      color,
      fillColor: color,
      fillOpacity: 0.1,
      weight: 1,
      opacity: 0.3,
    }).addTo(map);

    const marker = L.circleMarker([point.latitude, point.longitude], {
      radius: 8,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
    }).addTo(map);

    marker.bindPopup(createPopupMarkup(point, index, locationData.length, color));
  });

  const hasTimestamps = locationData.some((point) => point.timestamp);
  if (hasTimestamps) {
    const sortedPoints = [...locationData].sort(
      (left, right) =>
        new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
    );

    L.polyline(
      sortedPoints.map((point) => [point.latitude, point.longitude]),
      {
        color: '#8b5cf6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5',
      }
    ).addTo(map);
  }

  L.control.scale().addTo(map);

  return () => {
    map.off();
    map.remove();
  };
}

export async function resolveLocationAddresses(locationData) {
  const uniqueCoordinates = new Map();

  locationData.forEach((point) => {
    const pointKey = createPointKey(point);
    if (!uniqueCoordinates.has(pointKey)) {
      uniqueCoordinates.set(pointKey, point);
    }
  });

  const addressMap = new Map();

  for (const [pointKey, point] of uniqueCoordinates.entries()) {
    addressMap.set(pointKey, await resolveAddress(point.latitude, point.longitude));
    await delay(LOCATION_LOOKUP_DELAY_MS);
  }

  return locationData.map((point, index) => ({
    ...point,
    address: addressMap.get(createPointKey(point)) || 'Address not available',
    index,
  }));
}

export function calculateLocationStats(data) {
  const gpsPoints = data.filter((point) => point.source === 'GPS');
  const wifiPoints = data.filter((point) => point.source === 'Wi-Fi');
  const unknownPoints = data.filter((point) => point.source === 'Unknown');
  const timestamps = data
    .map((point) => new Date(point.timestamp))
    .filter((date) => !Number.isNaN(date.getTime()));

  let timeSpan = 'N/A';
  if (timestamps.length > 1) {
    const minTime = new Date(Math.min(...timestamps));
    const maxTime = new Date(Math.max(...timestamps));
    const diffSeconds = Math.round((maxTime - minTime) / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    timeSpan = diffSeconds > 0 ? `${minutes}m ${seconds}s` : '0s';
  }

  const avgGpsAccuracy = gpsPoints.length
    ? `${(
        gpsPoints.reduce((sum, point) => sum + point.accuracy, 0) / gpsPoints.length
      ).toFixed(1)}m`
    : 'N/A';

  const avgWifiAccuracy = wifiPoints.length
    ? `${(
        wifiPoints.reduce((sum, point) => sum + point.accuracy, 0) / wifiPoints.length
      ).toFixed(1)}m`
    : 'N/A';

  const latitudes = data.map((point) => point.latitude);
  const longitudes = data.map((point) => point.longitude);
  const latRange = Math.max(...latitudes) - Math.min(...latitudes);
  const lngRange = Math.max(...longitudes) - Math.min(...longitudes);
  const centerLat = data.reduce((sum, point) => sum + point.latitude, 0) / data.length;
  const approxAreaMeters = Math.abs(
    latRange * 111000 * (lngRange * 111000 * Math.cos((centerLat * Math.PI) / 180))
  );

  return {
    totalPoints: data.length,
    gpsPoints: gpsPoints.length,
    wifiPoints: wifiPoints.length,
    unknownPoints: unknownPoints.length,
    timeSpan,
    avgGpsAccuracy,
    avgWifiAccuracy,
    areaCoverage: `${Number.isFinite(approxAreaMeters) ? Math.round(approxAreaMeters) : 0} m²`,
  };
}
