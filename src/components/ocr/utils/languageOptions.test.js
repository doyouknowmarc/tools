import { beforeEach, describe, expect, it } from 'vitest';
import {
  getDefaultLanguage,
  getLastLanguage,
  saveLastLanguage,
} from './languageOptions';

describe('OCR language preferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('falls back to the default language when nothing is saved', () => {
    expect(getLastLanguage()).toBe(getDefaultLanguage());
  });

  it('persists the selected language', () => {
    saveLastLanguage('deu');
    expect(getLastLanguage()).toBe('deu');
  });
});
