import React, { useState, useEffect } from 'react';

function textToBinary(text) {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

function binaryToText(binary) {
  return binary
    .trim()
    .split(/\s+/)
    .map((bin) => {
      const code = parseInt(bin, 2);
      return isNaN(code) ? '' : String.fromCharCode(code);
    })
    .join('');
}

export default function TextConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('text-to-binary');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (mode === 'text-to-binary') {
      setOutput(textToBinary(input));
    } else {
      setOutput(binaryToText(input));
    }
  }, [input, mode]);

  const handleSwitch = () => {
    const newMode = mode === 'text-to-binary' ? 'binary-to-text' : 'text-to-binary';
    setMode(newMode);
    setInput(output);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input ({mode === 'text-to-binary' ? 'Text' : 'Binary'})
        </label>
        <textarea
          className="w-full min-h-[8rem] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder={
            mode === 'text-to-binary'
              ? 'Type or paste your text here...'
              : 'Enter binary, e.g. 01001000 01100101'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex justify-center">
        <button
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          onClick={handleSwitch}
        >
          Switch to {mode === 'text-to-binary' ? 'Binary to Text' : 'Text to Binary'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output ({mode === 'text-to-binary' ? 'Binary' : 'Text'})
        </label>
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
