export const LANGUAGE_OPTIONS = [
  { code: 'auto', name: 'Auto-detect', nativeName: 'Auto-detect' },
  { code: 'eng', name: 'English', nativeName: 'English' },
  { code: 'spa', name: 'Spanish', nativeName: 'Español' },
  { code: 'fra', name: 'French', nativeName: 'Français' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch' },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano' },
  { code: 'por', name: 'Portuguese', nativeName: 'Português' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'chi_tra', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語' },
  { code: 'kor', name: 'Korean', nativeName: '한국어' },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tha', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vie', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'nld', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pol', name: 'Polish', nativeName: 'Polski' },
  { code: 'swe', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'nor', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'dan', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fin', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'tur', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'heb', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'ces', name: 'Czech', nativeName: 'Čeština' },
  { code: 'hun', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ron', name: 'Romanian', nativeName: 'Română' },
  { code: 'bul', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hrv', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'slv', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'slk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'ukr', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ell', name: 'Greek', nativeName: 'Ελληνικά' },
];

export const getLanguageName = (code) => {
  const language = LANGUAGE_OPTIONS.find((lang) => lang.code === code);
  return language ? `${language.name} (${language.nativeName})` : code;
};

export const getDefaultLanguage = () => 'auto';

export const saveLastLanguage = (language) => {
  try {
    localStorage.setItem('ocr-last-language', language);
  } catch {
    // ignore
  }
};

export const getLastLanguage = () => {
  try {
    return localStorage.getItem('ocr-last-language') || getDefaultLanguage();
  } catch {
    return getDefaultLanguage();
  }
};
