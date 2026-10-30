import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Maximize2, Sun, X } from 'lucide-react';
import FullscreenOverlay from './FullscreenOverlay';
import { SCREEN_COLORS, contrastText, kelvinToHex, normalizeHex } from '../utils/screenColor';

const nextSwatch = (current, delta) => {
  const index = SCREEN_COLORS.findIndex((swatch) => swatch.hex === current);
  return SCREEN_COLORS[(index + delta + SCREEN_COLORS.length) % SCREEN_COLORS.length].hex;
};

function FullscreenColorTool() {
  const [color, setColor] = useState('#ffffff');
  const [hexDraft, setHexDraft] = useState(null);
  const [kelvin, setKelvin] = useState(5500);
  const [brightness, setBrightness] = useState(100);
  const [autoCycle, setAutoCycle] = useState(false);
  const [cycleSeconds, setCycleSeconds] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hint, setHint] = useState('');

  const hexInput = hexDraft ?? color;

  const selectColor = (hex) => {
    setColor(hex);
    setHexDraft(null);
  };

  const stepColor = (delta) => setColor((current) => nextSwatch(current, delta));

  const changeBrightness = (delta) => {
    const next = Math.min(100, Math.max(5, brightness + delta));
    setBrightness(next);
    setHint(`Brightness ${next}%`);
  };

  useEffect(() => {
    if (!isFullscreen || !autoCycle) {
      return undefined;
    }
    const interval = setInterval(() => setColor((current) => nextSwatch(current, 1)), cycleSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoCycle, cycleSeconds, isFullscreen]);

  const handleFullscreenKey = (event) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      stepColor(1);
    } else if (event.key === 'ArrowLeft') {
      stepColor(-1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      changeBrightness(10);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      changeBrightness(-10);
    }
  };

  const openFullscreen = (hex = color) => {
    selectColor(hex);
    setHint('');
    setIsFullscreen(true);
  };

  const activeSwatch = SCREEN_COLORS.find((swatch) => swatch.hex === color);
  const warmHex = kelvinToHex(kelvin);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900">Fill the screen</h2>
        <p className="text-sm text-gray-500">
          Pick a color and go fullscreen – a soft light for video calls, a green screen, a dead-pixel check, or just a
          very large color.
        </p>
      </div>

      <div
        className="relative flex aspect-video w-full items-end justify-between rounded-2xl p-4 shadow-inner ring-1 ring-gray-200"
        style={{ background: color }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black" style={{ opacity: 1 - brightness / 100 }} />
        <span
          className="relative font-mono text-sm font-semibold uppercase"
          style={{ color: contrastText(color) }}
        >
          {activeSwatch ? `${activeSwatch.label} · ` : ''}
          {color}
        </span>
        <button
          type="button"
          onClick={() => openFullscreen()}
          className="relative inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-800"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
          Go fullscreen
        </button>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-gray-700">Presets – double-click to go straight to fullscreen</legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {SCREEN_COLORS.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              aria-pressed={color === swatch.hex}
              onClick={() => selectColor(swatch.hex)}
              onDoubleClick={() => openFullscreen(swatch.hex)}
              className={clsx(
                'flex aspect-[4/3] items-end rounded-xl p-2 text-left text-xs font-semibold ring-offset-2 transition-transform hover:scale-105',
                color === swatch.hex ? 'ring-2 ring-gray-900' : 'ring-1 ring-gray-200'
              )}
              style={{ background: swatch.hex, color: contrastText(swatch.hex) }}
            >
              {swatch.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
          <span className="text-sm font-medium text-gray-700">Custom color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(event) => selectColor(event.target.value)}
              aria-label="Pick a custom color"
              className="h-11 w-14 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={hexInput}
              onChange={(event) => {
                setHexDraft(event.target.value);
                const normalized = normalizeHex(event.target.value);
                if (normalized) {
                  setColor(normalized);
                }
              }}
              onBlur={() => setHexDraft(null)}
              aria-label="Hex color"
              spellCheck={false}
              className={clsx(
                'w-full rounded-lg border px-3 py-2 font-mono text-sm uppercase focus:outline-none focus:ring-1',
                normalizeHex(hexInput)
                  ? 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                  : 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Ring light
            </span>
            <span className="font-mono text-xs text-gray-400">{kelvin} K</span>
          </div>
          <input
            type="range"
            min="2000"
            max="9000"
            step="100"
            value={kelvin}
            onChange={(event) => {
              setKelvin(Number(event.target.value));
              selectColor(kelvinToHex(Number(event.target.value)));
            }}
            aria-label="Light temperature"
            className="h-3 cursor-pointer appearance-none rounded-full"
            style={{ background: `linear-gradient(90deg, ${kelvinToHex(2000)}, ${kelvinToHex(5500)}, ${kelvinToHex(9000)})` }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Cozy candle</span>
            <button type="button" onClick={() => openFullscreen(warmHex)} className="font-semibold text-gray-900 underline-offset-2 hover:underline">
              Light me up
            </button>
            <span>Cool daylight</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4">
          <span className="flex justify-between text-sm font-medium text-gray-700">
            Brightness <span className="font-mono text-gray-400">{brightness}%</span>
          </span>
          <input
            type="range"
            min="5"
            max="100"
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
            className="accent-gray-900"
          />
          <span className="text-xs text-gray-500">Use ↑ / ↓ in fullscreen.</span>
        </label>

        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={autoCycle} onChange={(event) => setAutoCycle(event.target.checked)} className="h-4 w-4 accent-gray-900" />
            Auto-cycle presets (dead-pixel test)
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-600">
            Every
            <input
              type="range"
              min="1"
              max="10"
              value={cycleSeconds}
              disabled={!autoCycle}
              onChange={(event) => setCycleSeconds(Number(event.target.value))}
              className="flex-1 accent-gray-900 disabled:opacity-40"
            />
            <span className="w-8 font-mono text-gray-400">{cycleSeconds}s</span>
          </label>
          <span className="text-xs text-gray-500">In fullscreen: click, Space or → for the next color, ← to go back.</span>
        </div>
      </div>

      {isFullscreen ? (
        <FullscreenOverlay
          onClose={() => setIsFullscreen(false)}
          onKeyDown={handleFullscreenKey}
          aria-label="Fullscreen color"
          className="cursor-none"
          style={{ background: color }}
          onClick={() => stepColor(1)}
        >
          <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 1 - brightness / 100 }} />
          <div
            key={hint || 'intro'}
            className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
            style={{ animation: 'bt-hint 3s ease-out forwards' }}
          >
            <span className="rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
              {hint || 'Click / Space next color · ↑ ↓ brightness · Esc exit'}
            </span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsFullscreen(false);
            }}
            aria-label="Exit fullscreen"
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </FullscreenOverlay>
      ) : null}
    </div>
  );
}

export default FullscreenColorTool;
