export const STORAGE_KEY = 'helpful-tools-bigtext';

export const FONTS = [
  { id: 'impact', label: 'Impact', family: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif', weight: 400 },
  { id: 'heavy', label: 'Heavy', family: '"Arial Black", "Helvetica Neue", Arial, sans-serif', weight: 900 },
  { id: 'rounded', label: 'Rounded', family: 'ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", sans-serif', weight: 800 },
  { id: 'serif', label: 'Serif', family: 'Georgia, "Times New Roman", serif', weight: 700 },
  { id: 'mono', label: 'Mono', family: '"Courier New", ui-monospace, monospace', weight: 700 },
  { id: 'comic', label: 'Comic', family: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive', weight: 700 },
  { id: 'script', label: 'Script', family: '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive', weight: 400 },
];

export const BACKGROUNDS = [
  { id: 'solid', label: 'Solid', css: (s) => s.bgColor },
  { id: 'sunset', label: 'Sunset', css: () => 'linear-gradient(135deg, #ff512f 0%, #f09819 50%, #ff2a68 100%)' },
  { id: 'ocean', label: 'Ocean', css: () => 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #1e1b4b 100%)' },
  { id: 'candy', label: 'Candy', css: () => 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)' },
  { id: 'toxic', label: 'Toxic', css: () => 'linear-gradient(135deg, #a3e635 0%, #22c55e 50%, #064e3b 100%)' },
  { id: 'midnight', label: 'Midnight', css: () => 'radial-gradient(circle at 30% 20%, #312e81 0%, #0f172a 55%, #000 100%)' },
  { id: 'aurora', label: 'Aurora ✨', animated: 'bt-bg-shift', size: '400% 400%', css: () => 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #8b5cf6)' },
  { id: 'rainbow', label: 'Rainbow 🌈', animated: 'bt-bg-shift', size: '600% 100%', css: () => 'linear-gradient(90deg, #ff0040, #ff8c00, #ffe600, #00e05a, #00b3ff, #8a2be2, #ff0040)' },
  {
    id: 'stripes',
    label: 'Stripes',
    animated: 'bt-bg-stripes',
    css: (s) => `repeating-linear-gradient(45deg, ${s.bgColor} 0 20px, ${s.accentColor} 20px 40px)`,
  },
  {
    id: 'dots',
    label: 'Dots',
    css: (s) => `radial-gradient(${s.accentColor} 22%, transparent 24%) 0 0 / 36px 36px, ${s.bgColor}`,
  },
];

export const TEXT_STYLES = [
  { id: 'plain', label: 'Plain' },
  { id: 'shadow', label: 'Drop shadow' },
  { id: 'outline', label: 'Outline' },
  { id: 'neon', label: 'Neon' },
  { id: '3d', label: '3D' },
  { id: 'retro', label: 'Retro' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'glitch', label: 'Glitch' },
];

// perLetter motions animate each character separately with a staggered delay.
export const MOTIONS = [
  { id: 'none', label: 'Still' },
  { id: 'flow', label: 'Flow ➡️', description: 'Scrolls across like a ticker' },
  { id: 'wave', label: 'Wave 🌊', perLetter: true, keyframes: 'bt-wave', duration: 1.2 },
  { id: 'rainbow', label: 'Rainbow', perLetter: true, keyframes: 'bt-letter-rainbow', duration: 2 },
  { id: 'jump', label: 'Jump', perLetter: true, keyframes: 'bt-jump', duration: 0.9 },
  { id: 'pulse', label: 'Pulse 💓', keyframes: 'bt-pulse', duration: 1 },
  { id: 'shake', label: 'Shake 😱', keyframes: 'bt-shake', duration: 0.35 },
  { id: 'wobble', label: 'Wobble', keyframes: 'bt-wobble', duration: 1.6 },
  { id: 'spin', label: 'Spin 🌀', keyframes: 'bt-spin', duration: 3 },
  { id: 'zoom', label: 'Zoom', keyframes: 'bt-zoom', duration: 1.8 },
  { id: 'typewriter', label: 'Typewriter ⌨️' },
];

export const STROBE_COLORS = ['#ff0040', '#00ff88', '#0066ff', '#ffee00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

export const QUICK_PHRASES = [
  'YES ✅',
  'NO ❌',
  'LOL 😂',
  'BRB ☕',
  'SHHH 🤫',
  'THANK YOU 🙏',
  'I ♥ U',
  '🎉 PARTY 🎉',
  'YOU ROCK 🤘',
  'MUTED? 🔇',
  'LUNCH? 🍕',
  'GO GO GO 🚀',
];

export const EMOJI_RAIN_OPTIONS = ['🎉', '❤️', '🔥', '⭐', '😂', '🍕', '💸', '❄️', '🦄', '👏'];

export const DEFAULT_SETTINGS = {
  text: 'HELLO 👋',
  fontId: 'impact',
  backgroundId: 'aurora',
  bgColor: '#111827',
  textColor: '#ffffff',
  accentColor: '#ec4899',
  textStyleId: 'shadow',
  motionId: 'wave',
  speed: 1,
  uppercase: true,
  mirror: false,
  strobe: false,
  strobeHz: 6,
  emojiRain: '',
  slideshow: false,
  slideSeconds: 3,
  liveTyping: false,
};

const findOr = (list, id, fallback) => (list.some((item) => item.id === id) ? id : fallback);
const isHex = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const clamp = (value, min, max, fallback) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function sanitizeSettings(raw) {
  const value = raw && typeof raw === 'object' ? raw : {};
  const d = DEFAULT_SETTINGS;

  return {
    text: typeof value.text === 'string' ? value.text.slice(0, 500) : d.text,
    fontId: findOr(FONTS, value.fontId, d.fontId),
    backgroundId: findOr(BACKGROUNDS, value.backgroundId, d.backgroundId),
    bgColor: isHex(value.bgColor) ? value.bgColor : d.bgColor,
    textColor: isHex(value.textColor) ? value.textColor : d.textColor,
    accentColor: isHex(value.accentColor) ? value.accentColor : d.accentColor,
    textStyleId: findOr(TEXT_STYLES, value.textStyleId, d.textStyleId),
    motionId: findOr(MOTIONS, value.motionId, d.motionId),
    speed: clamp(value.speed, 0.25, 3, d.speed),
    uppercase: typeof value.uppercase === 'boolean' ? value.uppercase : d.uppercase,
    mirror: typeof value.mirror === 'boolean' ? value.mirror : d.mirror,
    // Strobe is never restored: it must always be switched on deliberately after the warning.
    strobe: false,
    strobeHz: clamp(value.strobeHz, 1, 12, d.strobeHz),
    emojiRain: EMOJI_RAIN_OPTIONS.includes(value.emojiRain) ? value.emojiRain : '',
    slideshow: typeof value.slideshow === 'boolean' ? value.slideshow : d.slideshow,
    slideSeconds: clamp(value.slideSeconds, 1, 30, d.slideSeconds),
    liveTyping: typeof value.liveTyping === 'boolean' ? value.liveTyping : d.liveTyping,
  };
}

export function restoreSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? sanitizeSettings(JSON.parse(stored)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or blocked – settings just won't survive a reload.
  }
}

export function getSlides(text, slideshow) {
  if (!slideshow) {
    return [text];
  }

  const slides = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return slides.length > 0 ? slides : [''];
}

// Splits into grapheme-ish units so emoji survive per-letter animation.
export function splitCharacters(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

// Deterministic pseudo-random in [0, 1) so renders stay pure.
export function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const pick = (list, seed) => list[Math.floor(seededRandom(seed) * list.length)];

export function randomizeSettings(current, seed = Date.now()) {
  const textStyleId = pick(TEXT_STYLES, seed + 1).id;
  const palette = [
    ['#ffffff', '#ec4899', '#111827'],
    ['#fef08a', '#ef4444', '#1e3a8a'],
    ['#22d3ee', '#a855f7', '#020617'],
    ['#000000', '#facc15', '#ffffff'],
    ['#f0abfc', '#22c55e', '#3b0764'],
    ['#ffffff', '#f97316', '#0c4a6e'],
  ];
  const [textColor, accentColor, bgColor] = pick(palette, seed + 2);

  return {
    ...current,
    fontId: pick(FONTS, seed + 3).id,
    backgroundId: pick(BACKGROUNDS, seed + 4).id,
    motionId: pick(MOTIONS, seed + 5).id,
    textStyleId,
    textColor,
    accentColor,
    bgColor,
  };
}
