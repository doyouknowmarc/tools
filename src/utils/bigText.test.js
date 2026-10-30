import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  getSlides,
  randomizeSettings,
  sanitizeSettings,
  seededRandom,
  splitCharacters,
} from './bigText';

describe('bigText utils', () => {
  it('falls back to defaults for invalid stored values', () => {
    const settings = sanitizeSettings({ fontId: 'nope', bgColor: 'red', speed: 99, text: 42 });

    expect(settings.fontId).toBe(DEFAULT_SETTINGS.fontId);
    expect(settings.bgColor).toBe(DEFAULT_SETTINGS.bgColor);
    expect(settings.speed).toBe(3);
    expect(settings.text).toBe(DEFAULT_SETTINGS.text);
  });

  it('never restores strobe mode', () => {
    expect(sanitizeSettings({ strobe: true }).strobe).toBe(false);
  });

  it('splits non-empty lines into slides only in slideshow mode', () => {
    expect(getSlides('ONE\n\n TWO \nTHREE', true)).toEqual(['ONE', 'TWO', 'THREE']);
    expect(getSlides('ONE\nTWO', false)).toEqual(['ONE\nTWO']);
    expect(getSlides('   ', true)).toEqual(['']);
  });

  it('keeps emoji intact when splitting characters', () => {
    expect(splitCharacters('HI 👋🏽')).toEqual(['H', 'I', ' ', '👋🏽']);
  });

  it('produces deterministic pseudo-random numbers', () => {
    expect(seededRandom(3)).toBe(seededRandom(3));
    expect(seededRandom(3)).toBeGreaterThanOrEqual(0);
    expect(seededRandom(3)).toBeLessThan(1);
  });

  it('randomizes styling while keeping the message', () => {
    const result = randomizeSettings({ ...DEFAULT_SETTINGS, text: 'KEEP ME' }, 1234);

    expect(result.text).toBe('KEEP ME');
    expect(sanitizeSettings(result)).toEqual({ ...result, strobe: false });
  });
});
