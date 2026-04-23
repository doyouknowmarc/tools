import React, { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';

function hexToRgb(hex) {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHsl(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const INITIAL_COLOR = '#3b82f6';

export default function ColorPickerTool() {
  const [hex, setHex] = useState(INITIAL_COLOR);
  const [hexInput, setHexInput] = useState(INITIAL_COLOR);
  const [copied, setCopied] = useState(null);

  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  const rgbString = `rgb(${r}, ${g}, ${b})`;
  const hslString = `hsl(${h}, ${s}%, ${l}%)`;

  const handleColorWheelChange = useCallback((e) => {
    const newHex = e.target.value;
    setHex(newHex);
    setHexInput(newHex);
  }, []);

  const handleHexInputChange = useCallback((e) => {
    const value = e.target.value;
    setHexInput(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setHex(value.toLowerCase());
    }
  }, []);

  const handleHexInputBlur = useCallback(() => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
      setHexInput(hex);
    }
  }, [hex, hexInput]);

  const handleCopy = useCallback((format, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(format);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const formats = [
    { key: 'hex', label: 'HEX', value: hex },
    { key: 'rgb', label: 'RGB', value: rgbString },
    { key: 'hsl', label: 'HSL', value: hslString },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-6">
        <input
          type="color"
          value={hex}
          onChange={handleColorWheelChange}
          aria-label="Color picker"
          className="h-24 w-48 cursor-pointer rounded-lg border border-gray-300 p-1"
        />

        <div
          className="h-16 w-full max-w-md rounded-xl border border-gray-200 shadow-inner"
          style={{ backgroundColor: hex }}
          aria-label={`Color preview: ${hex}`}
        />

        <div className="w-full max-w-md space-y-3">
          {formats.map(({ key, label, value }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="w-10 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </span>
              {key === 'hex' ? (
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexInputChange}
                  onBlur={handleHexInputBlur}
                  spellCheck={false}
                  aria-label="HEX value"
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-gray-800 outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  readOnly
                  spellCheck={false}
                  aria-label={`${label} value`}
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-gray-800 outline-none"
                />
              )}
              <button
                type="button"
                onClick={() => handleCopy(key, value)}
                aria-label={`Copy ${label} value`}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  copied === key
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {copied === key ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
