export const SCREEN_COLORS = [
  { id: 'white', label: 'White', hex: '#ffffff' },
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'red', label: 'Red', hex: '#ff0000' },
  { id: 'green', label: 'Green', hex: '#00ff00' },
  { id: 'blue', label: 'Blue', hex: '#0000ff' },
  { id: 'yellow', label: 'Yellow', hex: '#ffff00' },
  { id: 'cyan', label: 'Cyan', hex: '#00ffff' },
  { id: 'magenta', label: 'Magenta', hex: '#ff00ff' },
  { id: 'chroma-green', label: 'Green screen', hex: '#00b140' },
  { id: 'chroma-blue', label: 'Blue screen', hex: '#0047bb' },
  { id: 'gray', label: '18% Gray', hex: '#777777' },
  { id: 'pink', label: 'Hot pink', hex: '#ff2d95' },
];

export function normalizeHex(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }
  const digits = match[1].length === 3 ? match[1].replace(/./g, (c) => c + c) : match[1];
  return `#${digits.toLowerCase()}`;
}

const channel = (value) => Math.round(Math.min(255, Math.max(0, value)));
const toHex = (value) => channel(value).toString(16).padStart(2, '0');

// Approximates the color of a black-body light source (Tanner Helland's fit), for ring-light use.
export function kelvinToHex(kelvin) {
  const temp = Math.min(40000, Math.max(1000, kelvin)) / 100;
  let red;
  let green;
  let blue;

  if (temp <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(temp) - 161.1195681661;
  } else {
    red = 329.698727446 * (temp - 60) ** -0.1332047592;
    green = 288.1221695283 * (temp - 60) ** -0.0755148492;
  }

  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  }

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

// Picks black or white, whichever reads better on the given background.
export function contrastText(hex) {
  const normalized = normalizeHex(hex) ?? '#000000';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(normalized.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}
