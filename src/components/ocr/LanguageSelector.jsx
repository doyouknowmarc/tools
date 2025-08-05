import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LANGUAGE_OPTIONS, getLanguageName } from './utils/languageOptions';

export default function LanguageSelector({ selectedLanguage, onLanguageChange, disabled = false }) {
  return (
    <div className="relative">
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-black" />
          <span>Document Language</span>
        </div>
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10
            text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black
            transition-colors duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'}
          `}
        >
          {LANGUAGE_OPTIONS.map((language) => (
            <option key={language.code} value={language.code}>
              {language.code === 'auto' ? language.name : `${language.name} (${language.nativeName})`}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {selectedLanguage === 'auto'
          ? 'Tesseract will attempt to detect the language automatically'
          : `OCR will be optimized for ${getLanguageName(selectedLanguage)}`}
      </div>
    </div>
  );
}
