import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  FileJson,
  MapPin,
  RefreshCcw,
  Target,
  UploadCloud,
  Wifi,
} from 'lucide-react';
import {
  calculateLocationStats,
  createLocationMap,
  parseLocationDataFile,
  resolveLocationAddresses,
  SAMPLE_LOCATION_DATA,
} from '../utils/locationData';

function LocationDataTool() {
  const [view, setView] = useState('upload');
  const [locationData, setLocationData] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState('idle');

  const mapContainerRef = useRef(null);

  const showError = useCallback((message) => {
    setError(message);
    setSuccess('');
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setError('');
  }, []);

  const resetState = useCallback(() => {
    setView('upload');
    setLocationData([]);
    setAddresses([]);
    setAddressStatus('idle');
    setError('');
    setSuccess('');
  }, []);

  const downloadSample = useCallback(() => {
    const blob = new Blob([JSON.stringify(SAMPLE_LOCATION_DATA, null, 2)], {
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
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const file = files?.[0];
      if (!file) {
        return;
      }

      try {
        const prepared = await parseLocationDataFile(file);
        setLocationData(prepared);
        setView('visualize');
        showSuccess(`Successfully loaded ${prepared.length} location points.`);
      } catch (error) {
        if (error instanceof SyntaxError) {
          showError(`Invalid JSON file: ${error.message}`);
          return;
        }

        showError(
          error instanceof Error ? error.message : 'Unable to parse the location data file.'
        );
      }
    },
    [showError, showSuccess]
  );

  const handleInputChange = useCallback(
    async (event) => {
      await handleFiles(event.target.files);
      event.target.value = '';
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault();
      setIsDragOver(false);
      await handleFiles(event.dataTransfer.files);
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
    if (view !== 'visualize' || !locationData.length || !mapContainerRef.current) {
      return undefined;
    }

    let isCancelled = false;
    let cleanupMap = () => {};

    const initialiseMap = async () => {
      try {
        const destroyMap = await createLocationMap(mapContainerRef.current, locationData);
        if (isCancelled) {
          destroyMap();
          return;
        }

        cleanupMap = destroyMap;
      } catch (error) {
        console.error('Unable to load the location map', error);
      }
    };

    initialiseMap();

    return () => {
      isCancelled = true;
      cleanupMap();
    };
  }, [locationData, view]);

  useEffect(() => {
    if (view !== 'visualize' || !locationData.length) {
      return undefined;
    }

    let isCancelled = false;

    const loadAddresses = async () => {
      try {
        setAddressStatus('loading');
        const resolvedAddresses = await resolveLocationAddresses(locationData);
        if (!isCancelled) {
          setAddresses(resolvedAddresses);
          setAddressStatus('success');
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading addresses', error);
          setAddressStatus('error');
        }
      }
    };

    loadAddresses();

    return () => {
      isCancelled = true;
    };
  }, [locationData, view]);

  const calculatedStats = useMemo(
    () => (locationData.length ? calculateLocationStats(locationData) : null),
    [locationData]
  );

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
              Drag and drop your file here or click the button below to browse
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
              Your JSON file should contain an array of location objects with latitude
              and longitude values. Additional metadata is optional and will enrich the
              visualization.
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
                      point.source === 'GPS'
                        ? 'bg-rose-500'
                        : point.source === 'Wi-Fi'
                        ? 'bg-sky-500'
                        : 'bg-gray-400';
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

export default LocationDataTool;
