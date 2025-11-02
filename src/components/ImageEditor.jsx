import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Circle, RotateCcw, RotateCw, Square, X } from 'lucide-react';
import clsx from 'clsx';
import { getCroppedCanvas } from '../utils/canvas';

const backgroundOptions = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#000000' },
  { label: 'Custom', value: 'custom' }
];

const cropModes = [
  { label: 'Free', value: 'free', icon: null },
  { label: '1:1', value: 'square', icon: Square },
  { label: 'Circle', value: 'circle', icon: Circle }
];

const defaultZoom = 1;
const minCropSize = 120;
const resizeCursorByHandle = {
  n: 'ns',
  s: 'ns',
  e: 'ew',
  w: 'ew',
  ne: 'nesw',
  sw: 'nesw',
  nw: 'nwse',
  se: 'nwse'
};
const resizeHandleLabels = {
  n: 'top edge',
  s: 'bottom edge',
  e: 'right edge',
  w: 'left edge',
  ne: 'top-right corner',
  nw: 'top-left corner',
  se: 'bottom-right corner',
  sw: 'bottom-left corner'
};

function ImageEditor({ imageSrc, onClose, onApply, initialState }) {
  const containerRef = useRef(null);
  const resizingRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(defaultZoom);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [mode, setMode] = useState('free');
  const [background, setBackground] = useState('transparent');
  const [customBackground, setCustomBackground] = useState('#ffffff');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [containerBounds, setContainerBounds] = useState({ width: 0, height: 0 });
  const [cropSize, setCropSize] = useState(null);

  useEffect(() => {
    const nextCrop = initialState?.crop ?? { x: 0, y: 0 };
    setCrop(nextCrop);
    setZoom(initialState?.zoom ?? defaultZoom);
    setRotation(initialState?.rotation ?? 0);
    setCroppedAreaPixels(initialState?.croppedAreaPixels ?? null);
    setMode(initialState?.mode ?? 'free');
    setBackground(initialState?.backgroundSelection ?? 'transparent');
    setCustomBackground(initialState?.customBackground ?? '#ffffff');
    setApplying(false);
    setError('');
  }, [imageSrc, initialState]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const updateBounds = () => {
      const rect = element.getBoundingClientRect();
      setContainerBounds({ width: rect.width, height: rect.height });
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(element);
    window.addEventListener('resize', updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  useEffect(() => {
    if (mode !== 'free') {
      setCropSize(null);
      return;
    }

    if (!containerBounds.width || !containerBounds.height) {
      return;
    }

    setCropSize((current) => {
      if (current) {
        const width = Math.min(
          Math.max(current.width, minCropSize),
          containerBounds.width
        );
        const height = Math.min(
          Math.max(current.height, minCropSize),
          containerBounds.height
        );

        if (width !== current.width || height !== current.height) {
          return { width, height };
        }

        return current;
      }

      const initialWidth = Math.min(containerBounds.width * 0.8, containerBounds.width);
      const initialHeight = Math.min(containerBounds.height * 0.8, containerBounds.height);

      return {
        width: Math.max(minCropSize, initialWidth),
        height: Math.max(minCropSize, initialHeight)
      };
    });
  }, [containerBounds.height, containerBounds.width, mode]);

  const aspect = useMemo(() => {
    if (mode === 'square' || mode === 'circle') {
      return 1;
    }

    return undefined;
  }, [mode]);

  const cropOverlay = useMemo(() => {
    if (
      mode !== 'free' ||
      !cropSize ||
      !containerBounds.width ||
      !containerBounds.height
    ) {
      return null;
    }

    const left = (containerBounds.width - cropSize.width) / 2;
    const top = (containerBounds.height - cropSize.height) / 2;

    return {
      left,
      top,
      width: cropSize.width,
      height: cropSize.height
    };
  }, [containerBounds.height, containerBounds.width, cropSize, mode]);

  const resizeHandles = useMemo(() => {
    if (!cropOverlay) {
      return [];
    }

    return [
      { key: 'nw', x: 0, y: 0 },
      { key: 'n', x: cropOverlay.width / 2, y: 0 },
      { key: 'ne', x: cropOverlay.width, y: 0 },
      { key: 'e', x: cropOverlay.width, y: cropOverlay.height / 2 },
      { key: 'se', x: cropOverlay.width, y: cropOverlay.height },
      { key: 's', x: cropOverlay.width / 2, y: cropOverlay.height },
      { key: 'sw', x: 0, y: cropOverlay.height },
      { key: 'w', x: 0, y: cropOverlay.height / 2 }
    ];
  }, [cropOverlay]);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      const state = resizingRef.current;
      if (!state || mode !== 'free') {
        return;
      }

      event.preventDefault();

      const { startX, startY, startWidth, startHeight, direction } = state;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      let nextWidth = startWidth;
      let nextHeight = startHeight;

      if (direction.includes('e')) {
        nextWidth = startWidth + deltaX;
      }

      if (direction.includes('w')) {
        nextWidth = startWidth - deltaX;
      }

      if (direction.includes('s')) {
        nextHeight = startHeight + deltaY;
      }

      if (direction.includes('n')) {
        nextHeight = startHeight - deltaY;
      }

      if (!containerBounds.width || !containerBounds.height) {
        return;
      }

      const clampedWidth = Math.min(
        Math.max(nextWidth, minCropSize),
        containerBounds.width
      );
      const clampedHeight = Math.min(
        Math.max(nextHeight, minCropSize),
        containerBounds.height
      );

      setCropSize((current) => {
        if (current && current.width === clampedWidth && current.height === clampedHeight) {
          return current;
        }

        return {
          width: clampedWidth,
          height: clampedHeight
        };
      });
    },
    [containerBounds.height, containerBounds.width, mode]
  );

  const stopResizing = useCallback(() => {
    resizingRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopResizing);
  }, [handlePointerMove]);

  const startResizing = useCallback(
    (event, direction) => {
      if (mode !== 'free' || !cropSize) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      resizingRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startWidth: cropSize.width,
        startHeight: cropSize.height,
        direction
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', stopResizing);
    },
    [cropSize, handlePointerMove, mode, stopResizing]
  );

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
    },
    [handlePointerMove, stopResizing]
  );

  useEffect(() => {
    if (mode !== 'free' && resizingRef.current) {
      stopResizing();
    }
  }, [mode, stopResizing]);

  const handleRotation = useCallback((amount) => {
    setRotation((previous) => {
      const next = previous + amount;
      if (next <= -360 || next >= 360) {
        return 0;
      }
      return next;
    });
  }, []);

  const activeBackground = background === 'custom' ? customBackground : background;

  const previewBackgroundStyle = useMemo(() => {
    if (!activeBackground || activeBackground === 'transparent') {
      return {
        backgroundColor: '#111827',
        backgroundImage:
          'linear-gradient(45deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 75%, transparent 75%, transparent)',
        backgroundSize: '1.5rem 1.5rem'
      };
    }

    return { background: activeBackground };
  }, [activeBackground]);

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels) {
      setError('Please adjust the crop before applying your edits.');
      return;
    }

    setApplying(true);
    setError('');

    try {
      const canvas = await getCroppedCanvas(
        imageSrc,
        croppedAreaPixels,
        rotation,
        activeBackground,
        mode === 'circle'
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('We could not apply your edits. Please try again.');
            setApplying(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          onApply({
            url,
            blob,
            crop,
            zoom,
            rotation,
            mode,
            background: activeBackground,
            backgroundSelection: background,
            customBackground,
            croppedAreaPixels
          });
          setApplying(false);
        },
        'image/png',
        0.95
      );
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : 'We could not apply your edits. Please try again.'
      );
      setApplying(false);
    }
  }, [
    activeBackground,
    background,
    croppedAreaPixels,
    crop,
    customBackground,
    imageSrc,
    mode,
    onApply,
    rotation,
    zoom
  ]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex h-full w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit image</h2>
            <p className="text-sm text-gray-500">Adjust the crop, rotation, and background before downloading.</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 lg:flex-row">
          <div
            ref={containerRef}
            className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200"
            style={previewBackgroundStyle}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={mode === 'circle' ? 'round' : 'rect'}
              showGrid={mode !== 'circle'}
              cropSize={mode === 'free' && cropSize ? cropSize : undefined}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              restrictPosition={false}
            />
            {mode === 'free' && cropOverlay ? (
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="pointer-events-none absolute rounded-lg border border-white/70 shadow-[0_0_0_1px_rgba(17,24,39,0.6)]"
                  style={{
                    left: `${cropOverlay.left}px`,
                    top: `${cropOverlay.top}px`,
                    width: `${cropOverlay.width}px`,
                    height: `${cropOverlay.height}px`
                  }}
                >
                  {resizeHandles.map((handle) => (
                    <button
                      key={handle.key}
                      type="button"
                      className="pointer-events-auto absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-gray-900 shadow"
                      style={{
                        left: `${handle.x}px`,
                        top: `${handle.y}px`,
                        cursor: `${resizeCursorByHandle[handle.key]}-resize`
                      }}
                      onPointerDown={(event) => startResizing(event, handle.key)}
                      aria-label={`Resize crop ${resizeHandleLabels[handle.key] || 'handle'}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="w-full max-w-xs space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Crop</h3>
              <div className="flex items-center gap-2">
                {cropModes.map(({ label, value, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    className={clsx(
                      'flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                      mode === value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
                    )}
                    onClick={() => setMode(value)}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {mode === 'circle' ? (
                <p className="text-xs text-gray-500">Circle crops export as PNGs with transparent corners.</p>
              ) : null}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Zoom</h3>
                <span className="text-xs text-gray-500">{zoom.toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Rotation</h3>
                <span className="text-xs text-gray-500">{Math.round(rotation)}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                  onClick={() => handleRotation(-90)}
                >
                  <RotateCcw className="h-4 w-4" />
                  90°
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                  onClick={() => handleRotation(90)}
                >
                  <RotateCw className="h-4 w-4" />
                  90°
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                  onClick={() => setRotation(0)}
                >
                  Reset
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Background</h3>
              <div className="grid grid-cols-2 gap-2">
                {backgroundOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={clsx(
                      'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition',
                      background === option.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
                    )}
                    onClick={() => setBackground(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {background === 'custom' ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <span>Pick color</span>
                  <input
                    type="color"
                    value={customBackground}
                    onChange={(event) => setCustomBackground(event.target.value)}
                    aria-label="Custom background color"
                    className="h-8 w-12 cursor-pointer rounded border border-gray-200"
                  />
                </div>
              ) : null}
            </section>

            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm transition',
                  applying ? 'bg-gray-400' : 'bg-gray-900 hover:bg-gray-800'
                )}
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Applying…' : 'Apply edits'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageEditor;
