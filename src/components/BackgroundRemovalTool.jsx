import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Info, Loader2, RefreshCw, UploadCloud } from 'lucide-react';
import clsx from 'clsx';

const formatBytes = (value) => {
  if (!value) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

function BackgroundRemovalTool() {
  const [sourceImage, setSourceImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const progressLabel = useMemo(() => {
    if (!progress) {
      return null;
    }

    if (!progress.total || progress.total === 0) {
      return `Preparing ${progress.key}…`;
    }

    const percent = Math.round((progress.current / progress.total) * 100);
    return `Downloading ${progress.key} (${percent}%)`;
  }, [progress]);

  useEffect(() => () => {
    if (sourceImage?.url) {
      URL.revokeObjectURL(sourceImage.url);
    }
  }, [sourceImage?.url]);

  useEffect(() => () => {
    if (resultImage?.url) {
      URL.revokeObjectURL(resultImage.url);
    }
  }, [resultImage?.url]);

  const reset = useCallback(() => {
    setSourceImage((previous) => {
      if (previous?.url) {
        URL.revokeObjectURL(previous.url);
      }
      return null;
    });
    setResultImage((previous) => {
      if (previous?.url) {
        URL.revokeObjectURL(previous.url);
      }
      return null;
    });
    setError('');
    setProgress(null);
  }, []);

  const runBackgroundRemoval = useCallback(async (file) => {
    setProcessing(true);
    setError('');
    setProgress(null);

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(file, {
        output: {
          format: 'image/png',
          quality: 0.9,
          type: 'foreground'
        },
        progress: (key, current, total) => {
          setProgress({ key, current, total });
        }
      });

      const url = URL.createObjectURL(blob);
      setResultImage((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }

        return {
          url,
          size: blob.size,
          type: blob.type
        };
      });
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : 'We could not remove the background from this image. Please try a different file.'
      );
      setResultImage((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }
        return null;
      });
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  }, []);

  const selectFile = useCallback(
    (file) => {
      if (!file) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file (PNG, JPEG, or WebP).');
        return;
      }

      const nextUrl = URL.createObjectURL(file);
      setSourceImage((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }

        return {
          file,
          url: nextUrl,
          name: file.name,
          size: file.size,
          type: file.type
        };
      });

      setResultImage((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }
        return null;
      });

      setError('');
      runBackgroundRemoval(file);
    },
    [runBackgroundRemoval]
  );

  const handleFileInputChange = useCallback(
    (event) => {
      const [file] = event.target.files || [];
      selectFile(file);
      event.target.value = '';
    },
    [selectFile]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const [file] = event.dataTransfer?.files || [];
      selectFile(file);
    },
    [selectFile]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const downloadResult = useCallback(() => {
    if (!resultImage) {
      return;
    }

    const link = document.createElement('a');
    link.href = resultImage.url;
    const extension = resultImage.type === 'image/png' ? 'png' : 'webp';
    link.download = `background-removed.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage]);

  return (
    <div className="space-y-6">
      <div
        className={clsx(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 p-8 text-center transition-colors',
          'hover:border-gray-400 hover:bg-gray-50',
          processing && 'pointer-events-none opacity-70'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <UploadCloud className="mb-3 h-12 w-12 text-gray-400" />
        <p className="text-base font-medium text-gray-700">
          Drag & drop an image or
          <label className="mx-1 cursor-pointer text-gray-900 underline">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={handleFileInputChange}
            />
            browse
          </label>
          your device
        </p>
        <p className="mt-2 text-sm text-gray-500">Supports PNG, JPEG, and WebP images up to 25 MB.</p>
        {processing ? (
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Removing background…</span>
          </div>
        ) : null}
        {progressLabel ? <p className="mt-2 text-xs text-gray-500">{progressLabel}</p> : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {sourceImage ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Original</h2>
              <span className="text-xs text-gray-500">{formatBytes(sourceImage.size)}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-center bg-gray-100">
                <img
                  src={sourceImage.url}
                  alt="Original"
                  className="max-h-96 w-full object-contain"
                />
              </div>
              <div className="border-t border-gray-100 px-4 py-3 text-left text-xs text-gray-500">
                <p className="font-medium text-gray-700">{sourceImage.name || 'Uploaded image'}</p>
                <p>{sourceImage.type}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Background removed</h2>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatBytes(resultImage?.size)}</span>
                {resultImage ? (
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    onClick={downloadResult}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" /> Download
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex min-h-[24rem] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
              {resultImage ? (
                <img src={resultImage.url} alt="Background removed" className="max-h-96 w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center space-y-2 text-sm text-gray-500">
                  <Loader2 className={clsx('h-5 w-5', processing ? 'animate-spin text-gray-400' : 'text-gray-300')} />
                  <p>{processing ? 'Processing image…' : 'The processed image will appear here.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <Info className="mt-0.5 h-4 w-4 text-gray-400" />
            <div className="space-y-2">
              <p className="font-medium text-gray-700">How it works</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Drop or upload an image to automatically remove its background in your browser.</li>
                <li>The first run might take a little longer while the AI model downloads (it is cached afterwards).</li>
                <li>Download the result as a PNG with transparency once processing completes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {sourceImage ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={reset}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Start over</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default BackgroundRemovalTool;
