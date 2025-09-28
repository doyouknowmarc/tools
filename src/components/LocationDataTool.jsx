import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileJson, MapPin, RefreshCcw, UploadCloud, Wifi, Target } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SAMPLE_DATA = [
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

function LocationDataTool() {
  const [view, setView] = useState('upload');
  const [locationData, setLocationData] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState('idle');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const showError = useCallback((message) => {
    setError(message);
    setSuccess('');
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setError('');
  }, []);

  const destroyMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.off();
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setView('upload');
    setLocationData([]);
    setAddresses([]);
    setStats(null);
    setAddressStatus('idle');
    setError('');
    setSuccess('');
    destroyMap();
  }, [destroyMap]);

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_DATA, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-location-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseFile = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (!Array.isArray(json)) {
            showError('JSON file must contain an array of location objects.');
            return;
          }

          if (json.length === 0) {
            showError('JSON file contains no location data.');
            return;
          }

          const prepared = json.map((item, index) => ({
            latitude: item.latitude,
            longitude: item.longitude,
            accuracy: typeof item.accuracy === 'number' ? item.accuracy : 10,
            source: item.source || 'Unknown',
            timestamp: item.timestamp || new Date().toISOString(),
            id: item.id || `point-${index + 1}`,
          }));

          const invalidCount = prepared.filter(
            (item) =>
              typeof item.latitude !== 'number' || typeof item.longitude !== 'number'
          ).length;

          if (invalidCount > 0) {
            showError('Every item must include numeric latitude and longitude values.');
            return;
          }

          setLocationData(prepared);
          setView('visualize');
          setStats(calculateStats(prepared));
          showSuccess(`Successfully loaded ${prepared.length} location points.`);
        } catch (err) {
          showError(`Invalid JSON file: ${err.message}`);
        }
      };
      reader.onerror = () => {
        showError('Error reading file.');
      };
      reader.readAsText(file);
    },
    [showError, showSuccess]
  );

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) {
        return;
      }

      const isJsonType =
        file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

      if (!isJsonType) {
        showError('Please upload a JSON file.');
        return;
      }

      parseFile(file);
    },
    [parseFile, showError]
  );

  const handleInputChange = useCallback(
    (event) => {
      handleFiles(event.target.files);
      event.target.value = '';
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  useEffect(() => {
    if (view !== 'visualize' || locationData.length === 0) {
      return () => {};
    }

    if (!mapContainerRef.current) {
      return () => {};
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const centerLat =
      locationData.reduce((sum, point) => sum + point.latitude, 0) / locationData.length;
    const centerLng =
      locationData.reduce((sum, point) => sum + point.longitude, 0) / locationData.length;

    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    locationData.forEach((point, index) => {
      let color = '#6b7280';
      if (point.source === 'GPS') {
        color = '#ef4444';
      } else if (point.source === 'Wi-Fi') {
        color = '#3b82f6';
      }

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

      const time = new Date(point.timestamp).toLocaleTimeString();

      marker.bindPopup(
        `<div style="font-family: Inter, system-ui, sans-serif;">
            <h4 style="margin: 0 0 10px 0; color: ${color}; font-size: 16px;">
              ${point.source} Location
            </h4>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Accuracy:</strong> ±${point.accuracy.toFixed(
              1
            )}m</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Coordinates:</strong><br />
              ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}</p>
            <p style="margin: 6px 0; font-size: 12px; color: #6b7280;">Point #${index + 1} of ${
          locationData.length
        }</p>
          </div>`
      );
    });

    const hasTimestamps = locationData.some((point) => point.timestamp);
    if (hasTimestamps) {
      const sorted = [...locationData].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const polylineCoordinates = sorted.map((point) => [point.latitude, point.longitude]);
      L.polyline(polylineCoordinates, {
        color: '#8b5cf6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5',
      }).addTo(map);
    }

    L.control.scale().addTo(map);

    mapInstanceRef.current = map;

    return destroyMap;
  }, [destroyMap, locationData, view]);

  useEffect(() => {
    if (view !== 'visualize' || locationData.length === 0) {
      return;
    }

    let isCancelled = false;

    const loadAddresses = async () => {
      try {
        setAddressStatus('loading');

        const uniqueCoordinates = new Map();
        locationData.forEach((point, index) => {
          const key = `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
          if (!uniqueCoordinates.has(key)) {
            uniqueCoordinates.set(key, []);
          }
          uniqueCoordinates.get(key).push({ ...point, originalIndex: index });
        });

        const coordinateAddressMap = new Map();

        for (const [coordKey] of uniqueCoordinates) {
          if (isCancelled) {
            return;
          }
          const [lat, lng] = coordKey.split(',').map(Number);
          const address = await resolveAddress(lat, lng);
          coordinateAddressMap.set(coordKey, address);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        if (isCancelled) {
          return;
        }

        const list = locationData.map((point, index) => {
          const key = `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
          return {
            ...point,
            address: coordinateAddressMap.get(key) || 'Address not available',
            index,
          };
        });

        if (!isCancelled) {
          setAddresses(list);
          setAddressStatus('success');
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading addresses', err);
          setAddressStatus('error');
        }
      }
    };

    loadAddresses();

    return () => {
      isCancelled = true;
    };
  }, [locationData, view]);

  const resolveAddress = useCallback(async (lat, lng) => {
    const strategies = [
      {
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        type: 'reverse',
      },
      {
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        type: 'reverse',
      },
      {
        url: `https://nominatim.openstreetmap.org/search?format=json&lat=${lat}&lon=${lng}&limit=1&addressdetails=1&radius=100`,
        type: 'search',
      },
    ];

    for (const strategy of strategies) {
      try {
        const response = await fetch(strategy.url, {
          headers: {
            'User-Agent': 'HelpfulTools/LocationData/1.0',
          },
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
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
      } catch (err) {
        console.error('Address lookup failed', err);
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HelpfulTools/LocationData/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const parts = [];
          if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
          if (data.address.suburb) parts.push(data.address.suburb);
          if (data.address.city_district) parts.push(data.address.city_district);
          if (data.address.city) parts.push(data.address.city);
          if (parts.length > 0) {
            return `${parts.join(', ')} (general area)`;
          }
        }
      }
    } catch (err) {
      console.error('Fallback address lookup failed', err);
    }

    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }, []);

  const formatAddressFromData = (data) => {
    if (!data) {
      return '';
    }

    if (data.address) {
      const addr = data.address;
      const segments = [];

      if (addr.house_number && addr.road) {
        segments.push(`${addr.road} ${addr.house_number}`);
      } else if (addr.road) {
        segments.push(addr.road);
      } else if (addr.pedestrian) {
        segments.push(`${addr.pedestrian} (pedestrian)`);
      } else if (addr.footway) {
        segments.push(`${addr.footway} (footway)`);
      } else if (addr.path) {
        segments.push(`${addr.path} (path)`);
      }

      if (addr.neighbourhood) segments.push(addr.neighbourhood);
      else if (addr.suburb) segments.push(addr.suburb);
      else if (addr.residential) segments.push(addr.residential);

      if (addr.city_district) segments.push(addr.city_district);
      else if (addr.county) segments.push(addr.county);

      if (addr.city || addr.town || addr.village) {
        segments.push(addr.city || addr.town || addr.village);
      }

      if (segments.length <= 1) {
        if (addr.amenity) segments.push(`Near ${addr.amenity}`);
        if (addr.shop) segments.push(`Near ${addr.shop} shop`);
        if (addr.tourism) segments.push(`Near ${addr.tourism}`);
        if (addr.building) segments.push(`Near ${addr.building}`);
      }

      if (segments.length > 0) {
        return segments.join(', ');
      }
    }

    if (data.display_name) {
      const parts = data.display_name.split(', ').slice(0, 3);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }

    return '';
  };

  const calculatedStats = useMemo(() => stats, [stats]);

  return (
    <div className="space-y-6">
      {view === 'upload' ? (
        <div className="space-y-6">
          <div
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/60'
                : 'border-gray-200 bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Upload your location data JSON file
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Drag & drop your file here or click the button below to browse
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500">
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleInputChange}
                />
                Choose File
              </label>
              <button
                type="button"
                onClick={downloadSample}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <Download className="h-4 w-4" /> Download sample data
              </button>
            </div>
            {error ? (
              <div className="mt-6 w-full max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-6 w-full max-w-md rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileJson className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900">Expected JSON format</h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Your JSON file should contain an array of location objects with latitude and longitude
              values. Additional metadata is optional and will enrich the visualization.
            </p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <pre className="whitespace-pre-wrap break-all text-left text-xs text-gray-800">
{`[
  {
    "latitude": 37.773972,
    "longitude": -122.431297,
    "accuracy": 5.8,
    "source": "GPS",
    "timestamp": "2024-05-12T17:03:13Z",
    "id": "unique-id"
  }
]`}
              </pre>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-rose-500" />
                <span>
                  <strong>Required:</strong> <code className="font-mono">latitude</code>,{' '}
                  <code className="font-mono">longitude</code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-500" />
                <span>
                  <strong>Optional:</strong> <code className="font-mono">accuracy</code>,{' '}
                  <code className="font-mono">source</code>,{' '}
                  <code className="font-mono">timestamp</code>,{' '}
                  <code className="font-mono">id</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetState}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <RefreshCcw className="h-4 w-4" /> Upload new file
              </button>
              <button
                type="button"
                onClick={downloadSample}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <Download className="h-4 w-4" /> Download sample data
              </button>
            </div>
            {success ? (
              <div className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-600">
                {success}
              </div>
            ) : null}
          </div>

          {calculatedStats ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total points" value={calculatedStats.totalPoints} accent="bg-indigo-500" />
              <StatCard label="GPS points" value={calculatedStats.gpsPoints} accent="bg-rose-500" />
              <StatCard label="Wi-Fi points" value={calculatedStats.wifiPoints} accent="bg-sky-500" />
              <StatCard label="Time span" value={calculatedStats.timeSpan} accent="bg-amber-500" />
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/60">
              <div ref={mapContainerRef} className="h-[520px] w-full" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">Legend &amp; stats</h3>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">GPS location</p>
                    <p>High accuracy positioning sourced from GPS sensors.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-sky-500" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">Wi-Fi location</p>
                    <p>Network-based positioning with moderate accuracy.</p>
                  </div>
                </div>
              </div>
              {calculatedStats ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <MiniStat label="Avg GPS accuracy" value={calculatedStats.avgGpsAccuracy} />
                  <MiniStat label="Avg Wi-Fi accuracy" value={calculatedStats.avgWifiAccuracy} />
                  <MiniStat label="Area coverage" value={calculatedStats.areaCoverage} />
                  <MiniStat label="Unknown source" value={calculatedStats.unknownPoints} />
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Location addresses</h3>
                <span className="text-xs font-medium text-gray-400">
                  {addressStatus === 'loading'
                    ? 'Resolving addresses...'
                    : addressStatus === 'error'
                    ? 'Address lookup failed'
                    : `${addresses.length} entries`}
                </span>
              </div>
              <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-2">
                {addressStatus === 'loading' ? (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-sm text-gray-500">
                    Resolving nearby addresses...
                  </div>
                ) : addressStatus === 'error' ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Unable to load addresses right now. Map visualization remains available.
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-sm text-gray-500">
                    No addresses available for this dataset.
                  </div>
                ) : (
                  addresses.map((point, index) => {
                    const color =
                      point.source === 'GPS' ? 'bg-rose-500' : point.source === 'Wi-Fi' ? 'bg-sky-500' : 'bg-gray-400';
                    const time = new Date(point.timestamp).toLocaleTimeString();
                    const date = new Date(point.timestamp).toLocaleDateString();
                    return (
                      <div
                        key={`${point.id}-${index}`}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${color}`}
                        >
                          {index + 1}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{point.address}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <span role="img" aria-label="time">
                                🕒
                              </span>
                              {time} ({date})
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span role="img" aria-label="source">
                                📡
                              </span>
                              {point.source}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span role="img" aria-label="accuracy">
                                🎯
                              </span>
                              ±{point.accuracy.toFixed(1)}m
                            </span>
                          </div>
                          <p className="font-mono text-xs text-gray-400">
                            {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className={`h-10 w-10 rounded-xl ${accent} bg-opacity-90`} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function calculateStats(data) {
  const totalPoints = data.length;
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
    ? `${(gpsPoints.reduce((sum, point) => sum + point.accuracy, 0) / gpsPoints.length).toFixed(1)}m`
    : 'N/A';

  const avgWifiAccuracy = wifiPoints.length
    ? `${(wifiPoints.reduce((sum, point) => sum + point.accuracy, 0) / wifiPoints.length).toFixed(1)}m`
    : 'N/A';

  const latitudes = data.map((point) => point.latitude);
  const longitudes = data.map((point) => point.longitude);
  const latRange = Math.max(...latitudes) - Math.min(...latitudes);
  const lngRange = Math.max(...longitudes) - Math.min(...longitudes);

  const centerLat = data.reduce((sum, point) => sum + point.latitude, 0) / data.length;
  const approxAreaMeters = Math.abs(
    latRange * 111000 * (lngRange * 111000 * Math.cos((centerLat * Math.PI) / 180))
  );
  const areaCoverage = `${Number.isFinite(approxAreaMeters) ? Math.round(approxAreaMeters) : 0} m²`;

  return {
    totalPoints,
    gpsPoints: gpsPoints.length,
    wifiPoints: wifiPoints.length,
    unknownPoints: unknownPoints.length,
    timeSpan,
    avgGpsAccuracy,
    avgWifiAccuracy,
    areaCoverage,
  };
}

export default LocationDataTool;
