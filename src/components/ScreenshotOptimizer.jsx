import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Download, Info, Loader2, UploadCloud } from 'lucide-react';

const qualityPresets = [
  { label: 'High', value: 0.92, description: 'Slight savings, near-identical quality.' },
  { label: 'Balanced', value: 0.8, description: 'Great balance of clarity and size.' },
  { label: 'Aggressive', value: 0.6, description: 'Big size drop, mild softness.' }
];

const formatOptions = [
  { label: 'JPEG', mime: 'image/jpeg', extension: 'jpg' },
  { label: 'WebP', mime: 'image/webp', extension: 'webp' }
];

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const drawImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

function bytesToKb(size) {
  return `${(size / 1024).toFixed(1)} KB`;
}

function ScreenshotOptimizer() {
  const [file, setFile] = useState(null);
  const [inputUrl, setInputUrl] = useState('');
  const [quality, setQuality] = useState(qualityPresets[1].value);
  const [customQuality, setCustomQuality] = useState(qualityPresets[1].value);
  const [activePreset, setActivePreset] = useState('Balanced');
  const [format, setFormat] = useState(formatOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalInfo, setOriginalInfo] = useState(null);
  const [optimizedInfo, setOptimizedInfo] = useState(null);

  const hasSelection = Boolean(file);

  const reset = useCallback(() => {
    setFile(null);
    setInputUrl('');
    setOriginalInfo(null);
    setOptimizedInfo(null);
    setError('');
  }, []);

  useEffect(() => {
    if (!file) {
      return;
    }

    const optimise = async () => {
      setLoading(true);
      setError('');
      try {
        const dataUrl = await readFile(file);
        const img = await drawImage(dataUrl);
        setOriginalInfo({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, format.mime, quality)
        );

        if (!blob) {
          throw new Error('Unable to optimise image.');
        }

        const optimizedUrl = URL.createObjectURL(blob);
        setOptimizedInfo({
          url: optimizedUrl,
          size: blob.size,
          extension: format.extension
        });
      } catch (optimiseError) {
        setError(
          optimiseError instanceof Error
            ? optimiseError.message
            : 'We could not optimise this screenshot. Please try another file.'
        );
        setOptimizedInfo(null);
      } finally {
        setLoading(false);
      }
    };

    optimise();
  }, [file, format, quality]);

  useEffect(() => () => {
    if (optimizedInfo?.url) {
      URL.revokeObjectURL(optimizedInfo.url);
    }
  }, [optimizedInfo?.url]);

  const savings = useMemo(() => {
    if (!originalInfo || !optimizedInfo) return null;
    const diff = originalInfo.size - optimizedInfo.size;
    const ratio = diff / originalInfo.size;
    return {
      diff,
      ratio
    };
  }, [originalInfo, optimizedInfo]);

  const handlePresetClick = useCallback((preset) => {
    setActivePreset(preset.label);
    setQuality(preset.value);
    setCustomQuality(preset.value);
  }, []);

  const handleCustomQualityChange = useCallback((event) => {
    const next = Number(event.target.value);
    setActivePreset('Custom');
    setCustomQuality(next);
    setQuality(next);
  }, []);

  const handleFileSelection = useCallback((event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!/image\/(png|jpeg)/.test(selected.type)) {
      setError('Please choose a PNG or JPEG file.');
      return;
    }

    setFile(selected);
  }, []);

  const handleUrlSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!inputUrl.trim()) {
        setError('Enter a direct link to an image.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await fetch(inputUrl);
        const blob = await response.blob();

        if (!/image\/(png|jpeg)/.test(blob.type)) {
          throw new Error('The provided URL must point to a PNG or JPEG image.');
        }

        const namedFile = new File([blob], 'remote-image', { type: blob.type });
        setFile(namedFile);
      } catch (urlError) {
        setError(
          urlError instanceof Error
            ? urlError.message
            : 'Unable to fetch image from that URL.'
        );
      } finally {
        setLoading(false);
      }
    },
    [inputUrl]
  );

  const downloadOptimized = useCallback(() => {
    if (!optimizedInfo) return;
    const link = document.createElement('a');
    link.href = optimizedInfo.url;
    link.download = `optimized.${optimizedInfo.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [optimizedInfo]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/60">
            <label className="flex flex-col items-center justify-center space-y-3 text-center cursor-pointer">
              <UploadCloud className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Drop a PNG or JPEG screenshot</p>
                <p className="text-sm text-gray-500">or click to choose from your files</p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileSelection}
                className="hidden"
              />
            </label>
          </div>

          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Optimise from a URL</label>
            <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <input
                type="url"
                placeholder="https://example.com/screenshot.png"
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                Fetch
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Quality preset</p>
            <div className="grid grid-cols-3 gap-2">
              {qualityPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={clsx(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition',
                    activePreset === preset.label
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  <div>{preset.label}</div>
                  <div className="text-xs font-normal text-gray-400">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
            <div>
              <label className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                <span>Custom quality</span>
                <span>{Math.round(customQuality * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.01"
                value={customQuality}
                onChange={handleCustomQualityChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Output format</p>
            <div className="flex space-x-2">
              {formatOptions.map((option) => (
                <button
                  key={option.mime}
                  type="button"
                  onClick={() => setFormat(option)}
                  className={clsx(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                    format.mime === option.mime
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Optimisation summary</h3>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            </div>
            {!hasSelection && !loading && (
              <p className="mt-4 text-sm text-gray-500">
                Select a screenshot to see before/after savings and download the optimised version.
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            )}

            {originalInfo && optimizedInfo && !error && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Original</p>
                    <p className="font-medium text-gray-900">{bytesToKb(originalInfo.size)}</p>
                    <p className="text-xs text-gray-500">
                      {originalInfo.width} × {originalInfo.height} ·{' '}
                      {originalInfo.type.replace('image/', '').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Optimised</p>
                    <p className="font-medium text-gray-900">{bytesToKb(optimizedInfo.size)}</p>
                    <p className="text-xs text-gray-500">Saved metadata stripped via re-encoding</p>
                  </div>
                </div>

                {savings && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                    Saved {bytesToKb(savings.diff)} ({Math.round(savings.ratio * 100)}% smaller)
                  </div>
                )}

                <button
                  type="button"
                  onClick={downloadOptimized}
                  className="inline-flex items-center space-x-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                  <span>Download optimised file</span>
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span className="font-medium">Why this helps</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>• Smaller screenshots load faster in docs, decks, and support articles.</li>
              <li>• Re-encoding removes embedded metadata to keep files lightweight.</li>
              <li>• Balanced preset keeps crisp UI text while reducing file size.</li>
            </ul>
          </div>

          {hasSelection && (
            <button
              type="button"
              onClick={reset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScreenshotOptimizer;
