import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Dices, Maximize2, Pause, Play, RotateCcw, X, Zap } from 'lucide-react';
import FullscreenOverlay from './FullscreenOverlay';
import {
  BACKGROUNDS,
  DEFAULT_SETTINGS,
  EMOJI_RAIN_OPTIONS,
  FONTS,
  MOTIONS,
  QUICK_PHRASES,
  TEXT_STYLES,
  getSlides,
  persistSettings,
  randomizeSettings,
  restoreSettings,
  seededRandom,
  splitCharacters,
} from '../utils/bigText';

const FIT_PADDING = 0.08;
const RAIN_DROPS = 28;

function getTextStyle(settings, strobe) {
  const { textColor, accentColor, textStyleId } = settings;

  if (strobe) {
    return { textShadow: '0 0.04em 0.1em rgba(0,0,0,0.35)' };
  }

  switch (textStyleId) {
    case 'shadow':
      return { color: textColor, textShadow: '0 0.05em 0.14em rgba(0,0,0,0.45)' };
    case 'outline':
      return { color: 'transparent', WebkitTextStroke: `0.035em ${textColor}` };
    case 'neon':
      return {
        color: textColor,
        textShadow: `0 0 0.04em #fff, 0 0 0.12em ${accentColor}, 0 0 0.3em ${accentColor}, 0 0 0.6em ${accentColor}`,
      };
    case '3d':
      return {
        color: textColor,
        textShadow: [1, 2, 3, 4, 5, 6, 7, 8]
          .map((step) => `${step * 0.01}em ${step * 0.01}em 0 ${accentColor}`)
          .concat('0.1em 0.12em 0.15em rgba(0,0,0,0.5)')
          .join(', '),
      };
    case 'retro':
      return {
        color: textColor,
        fontStyle: 'italic',
        textShadow: `0.05em 0.05em 0 ${accentColor}, 0.1em 0.1em 0 rgba(0,0,0,0.35)`,
      };
    case 'glitch':
      return { color: textColor, animation: 'bt-glitch 0.6s steps(2, end) infinite' };
    default:
      return { color: textColor };
  }
}

const gradientTextStyle = (settings) => ({
  backgroundImage: `linear-gradient(90deg, ${settings.textColor}, ${settings.accentColor})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

function EmojiRain({ emoji, speed }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: RAIN_DROPS }, (_, index) => {
        const duration = (3 + seededRandom(index + 7) * 4) / speed;
        return (
          <span
            key={index}
            className="absolute top-0"
            style={{
              left: `${seededRandom(index) * 96}%`,
              fontSize: `${6 + seededRandom(index + 31) * 8}cqh`,
              animation: `bt-fall ${duration}s linear ${-seededRandom(index + 59) * duration}s infinite`,
              '--bt-fall-rotate': `${seededRandom(index + 83) > 0.5 ? '' : '-'}${180 + Math.round(seededRandom(index + 97) * 360)}deg`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

function BigTextDisplay({ settings, text, paused, typedCount, showCaret, className }) {
  const containerRef = useRef(null);
  const flowRef = useRef(null);
  const textRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const motion = MOTIONS.find((item) => item.id === settings.motionId) ?? MOTIONS[0];
  const font = FONTS.find((item) => item.id === settings.fontId) ?? FONTS[0];
  const background = BACKGROUNDS.find((item) => item.id === settings.backgroundId) ?? BACKGROUNDS[0];
  const isFlow = motion.id === 'flow';
  const isTypewriter = motion.id === 'typewriter';
  const strobe = settings.strobe;
  const isGradient = settings.textStyleId === 'gradient' && !strobe;

  let displayText = settings.uppercase ? text.toUpperCase() : text;
  if (isFlow) {
    displayText = displayText.replace(/\s*\n\s*/g, '   ');
  }
  if (!displayText.trim()) {
    displayText = showCaret ? '' : '…';
  }

  const splitLetters = motion.perLetter || isTypewriter;

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Find the biggest font size that still fits, then (for Flow) set up the ticker distance.
  useLayoutEffect(() => {
    const textEl = textRef.current;
    const flowEl = flowRef.current;
    if (!textEl || !flowEl || size.width === 0 || size.height === 0) {
      return;
    }

    const availableWidth = size.width * (1 - FIT_PADDING * 2);
    const availableHeight = size.height * (1 - FIT_PADDING * 2);
    textEl.style.maxWidth = isFlow ? 'none' : `${availableWidth}px`;

    const fits = (fontSize) => {
      textEl.style.fontSize = `${fontSize}px`;
      if (isFlow) {
        return textEl.offsetHeight <= availableHeight;
      }
      return textEl.scrollWidth <= availableWidth + 1 && textEl.offsetHeight <= availableHeight;
    };

    let low = 4;
    let high = Math.max(8, size.height * 1.5);
    for (let step = 0; step < 18; step += 1) {
      const mid = (low + high) / 2;
      if (fits(mid)) {
        low = mid;
      } else {
        high = mid;
      }
    }
    textEl.style.fontSize = `${Math.floor(low)}px`;

    if (isFlow) {
      const textWidth = textEl.offsetWidth;
      const pixelsPerSecond = Math.max(120, size.width * 0.45) * settings.speed;
      flowEl.style.setProperty('--bt-flow-from', `${size.width}px`);
      flowEl.style.setProperty('--bt-flow-to', `${-textWidth}px`);
      flowEl.style.animation = `bt-flow ${(size.width + textWidth) / pixelsPerSecond}s linear infinite`;
    } else {
      flowEl.style.animation = '';
    }
  }, [displayText, font.id, isFlow, settings.speed, settings.textStyleId, size]);

  const motionStyle = {};
  if (!isFlow && motion.keyframes && !motion.perLetter) {
    motionStyle.animation = `${motion.keyframes} ${motion.duration / settings.speed}s ease-in-out infinite`;
  }

  const containerStyle = { containerType: 'size' };
  if (strobe) {
    containerStyle.animation = `bt-strobe-bg ${8 / settings.strobeHz}s steps(1, end) infinite`;
    containerStyle.background = '#000';
  } else {
    containerStyle.background = background.css(settings);
    if (background.size) {
      containerStyle.backgroundSize = background.size;
    }
    if (background.animated) {
      const duration = background.animated === 'bt-bg-stripes' ? 1.2 : 10;
      containerStyle.animation = `${background.animated} ${duration / settings.speed}s linear infinite`;
    }
  }

  const textStyle = {
    fontFamily: font.family,
    fontWeight: font.weight,
    lineHeight: 1.08,
    whiteSpace: isFlow ? 'pre' : 'pre-wrap',
    textWrap: 'balance',
    textAlign: 'center',
    overflowWrap: 'normal',
    ...getTextStyle(settings, strobe),
    ...(isGradient && !splitLetters ? gradientTextStyle(settings) : {}),
  };
  if (strobe) {
    textStyle.animation = `bt-strobe-text ${8 / settings.strobeHz}s steps(1, end) infinite`;
  }

  let content = displayText;
  if (splitLetters) {
    let letterIndex = 0;
    content = displayText.split(/(\s+)/).map((token, tokenIndex) => {
      if (!token || /^\s+$/.test(token)) {
        letterIndex += token.length;
        return token;
      }
      return (
        <span key={tokenIndex} className="inline-block whitespace-nowrap">
          {splitCharacters(token).map((char) => {
            const index = letterIndex;
            letterIndex += 1;
            const letterStyle = isGradient ? gradientTextStyle(settings) : {};
            if (motion.perLetter) {
              const duration = motion.duration / settings.speed;
              letterStyle.animation = `${motion.keyframes} ${duration}s ease-in-out ${(index * 0.08) / settings.speed}s infinite`;
            }
            if (isTypewriter && index >= typedCount) {
              letterStyle.opacity = 0;
            }
            return (
              <span key={index} className="inline-block" style={letterStyle}>
                {char}
              </span>
            );
          })}
        </span>
      );
    });
  }

  return (
    <div
      ref={containerRef}
      className={clsx('relative flex items-center overflow-hidden', isFlow ? 'justify-start' : 'justify-center', paused && 'bt-paused', className)}
      style={containerStyle}
    >
      {settings.emojiRain ? <EmojiRain emoji={settings.emojiRain} speed={settings.speed} /> : null}
      <div style={{ transform: settings.mirror ? 'scaleX(-1)' : undefined }} className={clsx('relative', isFlow && 'w-full')}>
        <div ref={flowRef} className={clsx(isFlow ? 'w-max' : 'flex justify-center')}>
          <div style={motionStyle}>
            <div ref={textRef} className="inline-block select-none" style={textStyle} data-testid="big-text">
              {content}
              {showCaret ? (
                <span
                  className="ml-[0.05em] inline-block w-[0.08em] translate-y-[0.1em] bg-current"
                  style={{ height: '0.9em', animation: 'bt-caret 1s infinite', color: settings.textColor }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-gray-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            title={option.description}
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={clsx(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              value === option.id
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
            style={option.style}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        aria-label={`${label} color`}
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

function Toggle({ label, hint, checked, onChange, children }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 px-3 py-2">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 accent-gray-900"
        />
        <span>
          <span className="block text-sm font-medium text-gray-700">{label}</span>
          {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
        </span>
      </label>
      {children}
    </div>
  );
}

function StrobeWarning({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 p-4" role="alertdialog" aria-labelledby="strobe-warning-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex items-center gap-3 text-amber-600">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          <h3 id="strobe-warning-title" className="text-lg font-semibold text-gray-900">
            Photosensitivity warning
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Party mode flashes bright colors rapidly. Flashing lights can trigger seizures in people with
          photosensitive epilepsy. Don&apos;t point it at anyone who might be affected and stop immediately if
          anyone feels dizzy or unwell.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            I understand – flash it
          </button>
        </div>
      </div>
    </div>
  );
}

function BigTextTool() {
  const [settings, setSettings] = useState(restoreSettings);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [showStrobeWarning, setShowStrobeWarning] = useState(false);
  const [liveText, setLiveText] = useState('');

  const update = useCallback((patch) => setSettings((prev) => ({ ...prev, ...patch })), []);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const slides = useMemo(() => getSlides(settings.text, settings.slideshow), [settings.text, settings.slideshow]);
  const liveTypingActive = isFullscreen && settings.liveTyping;
  const currentSlide = liveTypingActive ? liveText : slides[slideIndex % slides.length];
  const isTypewriter = settings.motionId === 'typewriter' && !liveTypingActive;
  const letterCount = splitCharacters(currentSlide).length;

  useEffect(() => {
    if (!settings.slideshow || slides.length < 2 || paused) {
      return undefined;
    }
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
      setTypedCount(0);
    }, settings.slideSeconds * 1000);
    return () => clearInterval(interval);
  }, [paused, settings.slideSeconds, settings.slideshow, slides.length]);

  useEffect(() => {
    if (!isTypewriter || paused) {
      return undefined;
    }
    const interval = setInterval(() => {
      // Type the slide, linger a moment, then start over.
      setTypedCount((prev) => (prev > letterCount + 12 ? 0 : prev + 1));
    }, 110 / settings.speed);
    return () => clearInterval(interval);
  }, [isTypewriter, letterCount, paused, settings.speed]);

  const changeSlide = (delta) => {
    setSlideIndex((prev) => (prev + delta + slides.length) % slides.length);
    setTypedCount(0);
  };

  const handleFullscreenKey = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if (event.key === 'ArrowRight' && !settings.liveTyping) {
      changeSlide(1);
      return;
    }
    if (event.key === 'ArrowLeft' && !settings.liveTyping) {
      changeSlide(-1);
      return;
    }

    if (settings.liveTyping) {
      if (event.key === 'Backspace') {
        event.preventDefault();
        setLiveText((prev) => splitCharacters(prev).slice(0, -1).join(''));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        setLiveText((prev) => `${prev}\n`);
      } else if (event.key.length === 1 || /^\p{Extended_Pictographic}$/u.test(event.key)) {
        event.preventDefault();
        setLiveText((prev) => (prev + event.key).slice(0, 500));
      }
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      setPaused((prev) => !prev);
    }
  };

  const toggleStrobe = (checked) => {
    if (checked) {
      setShowStrobeWarning(true);
    } else {
      update({ strobe: false });
    }
  };

  const openFullscreen = () => {
    setLiveText('');
    setIsFullscreen(true);
  };

  const displayProps = {
    settings,
    text: currentSlide,
    paused,
    typedCount: isTypewriter ? typedCount : Infinity,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900">Say it BIG</h2>
        <p className="text-sm text-gray-500">
          Type something, style it, then go fullscreen to shout it across the room, through a window or into a video call.
        </p>
      </div>

      <div className="relative">
        <BigTextDisplay
          {...displayProps}
          className="aspect-video w-full cursor-zoom-in rounded-2xl shadow-inner ring-1 ring-gray-200"
        />
        <button
          type="button"
          onClick={openFullscreen}
          aria-label="Preview fullscreen"
          className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => setPaused((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/75"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={openFullscreen}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-transform hover:bg-gray-800 active:scale-[0.98]"
        >
          <Maximize2 className="h-5 w-5" aria-hidden="true" />
          GO BIG
        </button>
        <button
          type="button"
          onClick={() => setSettings((prev) => randomizeSettings(prev))}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Dices className="h-5 w-5" aria-hidden="true" />
          Surprise me
        </button>
        <button
          type="button"
          onClick={() => {
            setSettings(DEFAULT_SETTINGS);
            setSlideIndex(0);
            setPaused(false);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="big-text-input" className="text-sm font-medium text-gray-700">
          Your message
        </label>
        <textarea
          id="big-text-input"
          rows={3}
          maxLength={500}
          value={settings.text}
          onChange={(event) => {
            update({ text: event.target.value });
            setSlideIndex(0);
            setTypedCount(0);
          }}
          placeholder="Type something loud…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <div className="flex flex-wrap gap-2">
          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => {
                update({ text: phrase, slideshow: false });
                setSlideIndex(0);
                setTypedCount(0);
              }}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <ChipGroup
            label="Font"
            options={FONTS.map((font) => ({ ...font, style: { fontFamily: font.family, fontWeight: font.weight } }))}
            value={settings.fontId}
            onChange={(fontId) => update({ fontId })}
          />
          <ChipGroup label="Text style" options={TEXT_STYLES} value={settings.textStyleId} onChange={(textStyleId) => update({ textStyleId })} />
          <ChipGroup label="Motion" options={MOTIONS} value={settings.motionId} onChange={(motionId) => {
            update({ motionId });
            setTypedCount(0);
          }} />
          <label className="flex flex-col gap-2">
            <span className="flex justify-between text-sm font-medium text-gray-700">
              Speed <span className="font-mono text-gray-400">{settings.speed.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={settings.speed}
              onChange={(event) => update({ speed: Number(event.target.value) })}
              className="accent-gray-900"
            />
          </label>
        </div>

        <div className="flex flex-col gap-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Background</legend>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUNDS.map((background) => (
                <button
                  key={background.id}
                  type="button"
                  title={background.label}
                  aria-label={`${background.label} background`}
                  aria-pressed={settings.backgroundId === background.id}
                  onClick={() => update({ backgroundId: background.id })}
                  className={clsx(
                    'flex aspect-square items-end justify-center overflow-hidden rounded-lg p-1 text-[10px] font-semibold text-white ring-offset-2 transition-transform hover:scale-105',
                    settings.backgroundId === background.id ? 'ring-2 ring-gray-900' : 'ring-1 ring-gray-200'
                  )}
                  style={{ background: background.css(settings), backgroundSize: background.size }}
                >
                  <span className="truncate rounded bg-black/40 px-1">{background.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2 sm:grid-cols-3">
            <ColorField label="Text" value={settings.textColor} onChange={(textColor) => update({ textColor })} />
            <ColorField label="Accent" value={settings.accentColor} onChange={(accentColor) => update({ accentColor })} />
            <ColorField label="Background" value={settings.bgColor} onChange={(bgColor) => update({ bgColor })} />
          </div>
          <ChipGroup
            label="Emoji rain"
            options={[{ id: '', label: 'Off' }, ...EMOJI_RAIN_OPTIONS.map((emoji) => ({ id: emoji, label: emoji }))]}
            value={settings.emojiRain}
            onChange={(emojiRain) => update({ emojiRain })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="ALL CAPS" hint="Because shouting is more fun." checked={settings.uppercase} onChange={(uppercase) => update({ uppercase })} />
        <Toggle
          label="Mirror"
          hint="Flip horizontally – readable from behind a window or in a mirror."
          checked={settings.mirror}
          onChange={(mirror) => update({ mirror })}
        />
        <Toggle
          label="Slideshow"
          hint="Each line becomes its own slide. Use ← / → in fullscreen."
          checked={settings.slideshow}
          onChange={(slideshow) => {
            update({ slideshow });
            setSlideIndex(0);
          }}
        >
          {settings.slideshow ? (
            <label className="flex items-center gap-3 pb-1 pl-7 text-sm text-gray-600">
              Every
              <input
                type="range"
                min="1"
                max="15"
                value={settings.slideSeconds}
                onChange={(event) => update({ slideSeconds: Number(event.target.value) })}
                className="flex-1 accent-gray-900"
              />
              <span className="w-8 font-mono text-gray-400">{settings.slideSeconds}s</span>
            </label>
          ) : null}
        </Toggle>
        <Toggle
          label="Live typing"
          hint="Fullscreen starts blank – type on your keyboard and it appears huge."
          checked={settings.liveTyping}
          onChange={(liveTyping) => update({ liveTyping })}
        />
      </div>

      <div
        className={clsx(
          'flex flex-col gap-4 rounded-xl border-2 border-dashed p-4 sm:flex-row sm:items-center',
          settings.strobe ? 'border-fuchsia-400 bg-fuchsia-50' : 'border-gray-200'
        )}
      >
        <div className="flex flex-1 items-start gap-3">
          <Zap className={clsx('mt-0.5 h-6 w-6 shrink-0', settings.strobe ? 'text-fuchsia-500' : 'text-gray-400')} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Party mode (strobe)</p>
            <p className="text-xs text-gray-500">
              Rapidly flashing colors. ⚠️ Not safe for people with photosensitive epilepsy.
            </p>
          </div>
        </div>
        {settings.strobe ? (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="range"
              min="1"
              max="12"
              value={settings.strobeHz}
              onChange={(event) => update({ strobeHz: Number(event.target.value) })}
              className="w-32 accent-fuchsia-500"
              aria-label="Flashes per second"
            />
            <span className="w-14 font-mono text-gray-400">{settings.strobeHz}/sec</span>
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => toggleStrobe(!settings.strobe)}
          aria-pressed={settings.strobe}
          className={clsx(
            'rounded-lg px-4 py-2 text-sm font-semibold',
            settings.strobe ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-600' : 'bg-gray-900 text-white hover:bg-gray-800'
          )}
        >
          {settings.strobe ? 'Stop the party' : 'Enable party mode'}
        </button>
      </div>

      {showStrobeWarning ? (
        <StrobeWarning
          onCancel={() => setShowStrobeWarning(false)}
          onConfirm={() => {
            setShowStrobeWarning(false);
            update({ strobe: true });
          }}
        />
      ) : null}

      {isFullscreen ? (
        <FullscreenOverlay onClose={() => setIsFullscreen(false)} onKeyDown={handleFullscreenKey} aria-label="Big text fullscreen">
          <BigTextDisplay {...displayProps} showCaret={liveTypingActive} className="h-full w-full" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
            style={{ animation: 'bt-hint 4s ease-out forwards' }}
          >
            <span className="rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
              {liveTypingActive ? 'Start typing' : 'Space pause'}
              {!liveTypingActive && slides.length > 1 ? ' · ← → slides' : ''} · Esc exit
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Exit fullscreen"
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </FullscreenOverlay>
      ) : null}
    </div>
  );
}

export default BigTextTool;
