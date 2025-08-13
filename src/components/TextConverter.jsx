import React, { useState, useEffect } from 'react';

function textToBinary(text) {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

export default function TextConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('binary');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (mode === 'binary') {
      setOutput(textToBinary(input));
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
        <textarea
          className="w-full min-h-[8rem] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Type or paste your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Convert to</label>
        <select
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="binary">Binary</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
        <textarea
          className="w-full min-h-[8rem] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Converted text will appear here..."
          value={output}
          readOnly
        />
      </div>
    </div>
  );
}
