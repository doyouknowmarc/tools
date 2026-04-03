import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Download, Loader2, RefreshCw, UploadCloud } from 'lucide-react';
import {
  SegmentError,
  maskPreview,
  rgbaToPngBlob,
  segmentByOuterContour,
} from '../utils/lineSegmentation';

const acceptedMimeTypes = ['image/png', 'image/jpeg'];
const keepModeOptions = [
  { label: 'Inside', value: 'inside' },
  { label: 'Outside', value: 'outside' },
];

function createDownloadName(filename) {
  const stem = filename.replace(/\.[^.]+$/u, '') || 'segmented-image';
  return `${stem}-transparent.png`;
}

function loadImageDataFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas rendering is not available in this browser.'));
        return;
      }

      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, width, height));
    };

    image.onerror = () => {
      reject(new Error('We could not read this image. Please try another PNG or JPEG file.'));
    };

    image.src = url;
  });
}

export default function ContourSegmenter() {
  const [sourceImage, setSourceImage] = useState(null);
  const [threshold, setThreshold] = useState(70);
  const [keepMode, setKeepMode] = useState('inside');
  const [maskPreviewUrl, setMaskPreviewUrl] = useState('');
  const [resultPreviewUrl, setResultPreviewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      if (sourceImage?.url) {
        URL.revokeObjectURL(sourceImage.url);
      }
    },
    [sourceImage?.url]
  );

  useEffect(
    () => () => {
      if (maskPreviewUrl) {
        URL.revokeObjectURL(maskPreviewUrl);
      }
    },
    [maskPreviewUrl]
  );

  useEffect(
    () => () => {
      if (resultPreviewUrl) {
        URL.revokeObjectURL(resultPreviewUrl);
      }
    },
    [resultPreviewUrl]
  );

  useEffect(() => {
    if (!sourceImage?.url) {
      setMaskPreviewUrl('');
      setResultPreviewUrl('');
      setProcessing(false);
      setError('');
      return undefined;
    }

    let cancelled = false;

    const processImage = async () => {
      setProcessing(true);
      setError('');

      try {
        const imageData = await loadImageDataFromUrl(sourceImage.url);
        const segmentation = segmentByOuterContour(imageData, threshold, { keepMode });
        const [maskBlob, resultBlob] = await Promise.all([
          rgbaToPngBlob(maskPreview(segmentation.lineMask)),
          rgbaToPngBlob(segmentation.outputRgba),
        ]);

        if (cancelled) {
          return;
        }

        const nextMaskPreviewUrl = URL.createObjectURL(maskBlob);
        const nextResultPreviewUrl = URL.createObjectURL(resultBlob);

        setMaskPreviewUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return nextMaskPreviewUrl;
        });

        setResultPreviewUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return nextResultPreviewUrl;
        });
      } catch (processingError) {
        if (cancelled) {
          return;
        }

        setMaskPreviewUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return '';
        });
        setResultPreviewUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return '';
        });

        if (processingError instanceof SegmentError || processingError instanceof Error) {
          setError(processingError.message);
        } else {
          setError('We could not segment this image. Please try another file.');
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    };

    processImage();

    return () => {
      cancelled = true;
    };
  }, [keepMode, sourceImage?.url, threshold]);

  const handleSelectFile = useCallback((file) => {
    if (!file) {
      return;
    }

    if (!acceptedMimeTypes.includes(file.type)) {
      setError('Please choose a PNG or JPEG image.');
      return;
    }

    const nextUrl = URL.createObjectURL(file);

    setSourceImage((previous) => {
      if (previous?.url) {
        URL.revokeObjectURL(previous.url);
      }

      return {
        file,
        name: file.name,
        url: nextUrl,
      };
    });
  }, []);

  const handleFileInputChange = useCallback(
    (event) => {
      const [file] = event.target.files || [];
      handleSelectFile(file);
      event.target.value = '';
    },
    [handleSelectFile]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const [file] = event.dataTransfer?.files || [];
      handleSelectFile(file);
    },
    [handleSelectFile]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const reset = useCallback(() => {
    setSourceImage((previous) => {
      if (previous?.url) {
        URL.revokeObjectURL(previous.url);
      }
      return null;
    });
    setMaskPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return '';
    });
    setResultPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return '';
    });
    setError('');
    setProcessing(false);
    setThreshold(70);
    setKeepMode('inside');
  }, []);

  const canDownload = Boolean(resultPreviewUrl) && !processing;
  const downloadName = useMemo(
    () => (sourceImage?.name ? createDownloadName(sourceImage.name) : 'segmented-image-transparent.png'),
    [sourceImage?.name]
  );

  const downloadResult = useCallback(() => {
    if (!resultPreviewUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = resultPreviewUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadName, resultPreviewUrl]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,22rem)]">
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-6 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
              <UploadCloud className="h-10 w-10 text-gray-400" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-gray-900">
                  Upload an image for contour segmentation
                </p>
                <p className="text-sm text-gray-500">
                  Drop a PNG or JPEG here, or click to choose a file.
                </p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                aria-label="Upload image"
                onChange={handleFileInputChange}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </h2>
                <p className="mt-1 text-sm text-gray-700">
                  {sourceImage?.name ?? 'No image selected yet.'}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>

            {processing ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing contour segmentation…
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {!sourceImage ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                The tool keeps either the area inside or outside the first closed dark contour
                and exports the result as a transparent PNG.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700">
              <span>Line threshold</span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                {threshold}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={threshold}
              aria-label="Line threshold"
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="mt-3 w-full accent-gray-900"
              disabled={!sourceImage}
            />
            <p className="mt-2 text-xs text-gray-500">
              Visible pixels at or below this grayscale value are treated as contour lines.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Keep region</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {keepModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setKeepMode(option.value)}
                  disabled={!sourceImage}
                  className={clsx(
                    'rounded-xl border px-3 py-2 text-sm font-medium transition',
                    keepMode === option.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                    !sourceImage && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={downloadResult}
            disabled={!canDownload}
            className={clsx(
              'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition',
              canDownload
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            )}
          >
            <Download className="h-4 w-4" />
            Download transparent PNG
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Original</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {sourceImage ? (
              <img
                src={sourceImage.url}
                alt="Original upload"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm text-gray-400">
                Upload an image to preview it here.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Detected line mask
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {maskPreviewUrl ? (
              <img
                src={maskPreviewUrl}
                alt="Detected line mask"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm text-gray-400">
                {processing
                  ? 'Building the line mask…'
                  : 'The line mask preview will appear after processing.'}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Result</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
            {resultPreviewUrl ? (
              <img
                src={resultPreviewUrl}
                alt="Segmented result"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm text-gray-400">
                {processing
                  ? 'Applying the transparency mask…'
                  : 'The segmented result will appear after processing.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
