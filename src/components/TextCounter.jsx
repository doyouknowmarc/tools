import React, { useState } from 'react';
import { PenLine } from 'lucide-react';

export default function TextCounter() {
  const [text, setText] = useState('');
  
  const countWords = () => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };
  
  const countCharacters = () => {
    return text.length;
  };
  
  const countSpaces = () => {
    return (text.match(/ /g) || []).length;
  };

  return (
    <div className="flex flex-col h-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Type or paste your text here
      </label>
      <textarea
        className="w-full min-h-[16rem] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700">Words</p>
          <p className="text-2xl font-bold text-gray-800">{countWords()}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700">Characters</p>
          <p className="text-2xl font-bold text-gray-800">{countCharacters()}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700">Spaces</p>
          <p className="text-2xl font-bold text-gray-800">{countSpaces()}</p>
        </div>
      </div>
    </div>
  );
}