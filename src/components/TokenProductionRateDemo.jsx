import React, { useState, useRef, useEffect } from 'react';

const loremWords = [
  'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'Ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'Duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'Excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'Sed', 'perspiciatis',
  'unde', 'omnis', 'iste', 'natus', 'error', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae',
  'dicta', 'explicabo', 'Nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur',
  'aut', 'odit', 'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores',
  'eos', 'ratione', 'sequi', 'nesciunt', 'Neque', 'porro', 'quisquam',
  'technology', 'artificial', 'intelligence', 'machine', 'learning', 'algorithm',
  'processing', 'generation', 'language', 'model', 'neural', 'network', 'system',
  'computing', 'digital', 'innovation', 'development', 'research', 'analysis'
];

function generateTokens(wordCount) {
  const result = [];
  for (let i = 0; i < wordCount; i++) {
    const word = loremWords[Math.floor(Math.random() * loremWords.length)];
    if (word.length > 7 && Math.random() > 0.6) {
      const mid = Math.floor(word.length / 2);
      result.push(word.substring(0, mid));
      result.push(word.substring(mid));
    } else {
      result.push(word);
    }
    if (Math.random() > 0.8) {
      const punctuation = [',', '.', ';', '!', '?'];
      result.push(punctuation[Math.floor(Math.random() * punctuation.length)]);
    }
  }
  return result;
}

export default function TokenProductionRateDemo() {
  const [textLength, setTextLength] = useState(500);
  const [tokenSpeed, setTokenSpeed] = useState(25);
  const [tokens, setTokens] = useState([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [outputTokens, setOutputTokens] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const generationIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopGeneration();
    };
  }, []);

  const startGeneration = () => {
    if (isGenerating) return;
    const newTokens = generateTokens(textLength);
    setTokens(newTokens);
    setCurrentTokenIndex(0);
    setOutputTokens([]);
    setIsGenerating(true);
    startTimeRef.current = Date.now();

    const intervalTime = 1000 / tokenSpeed;
    generationIntervalRef.current = setInterval(() => {
      setCurrentTokenIndex((index) => {
        const token = newTokens[index];
        if (token === undefined) {
          stopGeneration();
          return index;
        }
        setOutputTokens((prev) => [...prev, token]);
        return index + 1;
      });
    }, intervalTime);

    timeIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setTimeElapsed((Date.now() - startTimeRef.current) / 1000);
      }
    }, 100);
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
    }
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
  };

  const resetDemo = () => {
    stopGeneration();
    setTokens([]);
    setCurrentTokenIndex(0);
    setOutputTokens([]);
    setTimeElapsed(0);
  };

  const tokensGenerated = currentTokenIndex;
  const currentSpeed = timeElapsed > 0 ? (tokensGenerated / timeElapsed).toFixed(1) : 0;
  const progress = tokens.length > 0 ? ((tokensGenerated / tokens.length) * 100).toFixed(1) : 0;

  return (
    <div className="font-mono text-black space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold border-b-2 border-black pb-4">Token Production Rate Demo</h2>
      </div>

      <div className="border-2 border-black p-6 bg-gray-50">
        <h3 className="font-bold mb-4">📖 Human Reading Speed Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1"><strong>Average Reading Speed:</strong> 200-300 words/minute</p>
            <p className="mb-1"><strong>Speed Readers:</strong> 400-700 words/minute</p>
            <p><strong>Tokens per second:</strong> ~5-12 tokens/sec (average)</p>
          </div>
          <div>
            <p className="mb-1"><strong>Comfortable Processing:</strong> 3-8 tokens/sec</p>
            <p className="mb-1"><strong>Fast Processing:</strong> 10-15 tokens/sec</p>
            <p><strong>Beyond Human:</strong> 20+ tokens/sec</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-black p-6">
        <div>
          <label htmlFor="textLength" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Text Length: <span>{textLength}</span> words
          </label>
          <input
            id="textLength"
            type="range"
            min="100"
            max="2000"
            step="50"
            value={textLength}
            onChange={(e) => setTextLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="tokenSpeed" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Speed: <span>{tokenSpeed}</span> tokens/second
          </label>
          <input
            id="tokenSpeed"
            type="range"
            min="1"
            max="100"
            step="1"
            value={tokenSpeed}
            onChange={(e) => setTokenSpeed(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-4">
        <button
          className="px-6 py-2 border-2 border-black bg-black text-white font-bold uppercase tracking-wide hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={startGeneration}
          disabled={isGenerating}
        >
          Start
        </button>
        <button
          className="px-6 py-2 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white disabled:opacity-50"
          onClick={stopGeneration}
          disabled={!isGenerating}
        >
          Stop
        </button>
        <button
          className="px-6 py-2 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white"
          onClick={resetDemo}
        >
          Reset
        </button>
      </div>

      <div className="bg-black text-white p-6 border-2 border-black min-h-[300px] text-sm leading-relaxed overflow-y-auto">
        {outputTokens.map((t, i) => (
          <span key={i}>{(i > 0 ? ' ' : '') + t}</span>
        ))}
        {isGenerating && <span className="bg-white text-black px-1 ml-1 animate-pulse">|</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-2 border-black p-4 text-center">
          <div className="text-xl font-bold mb-1">{tokensGenerated}</div>
          <div className="text-xs uppercase tracking-wide">Tokens Generated</div>
        </div>
        <div className="border-2 border-black p-4 text-center">
          <div className="text-xl font-bold mb-1">{currentSpeed}</div>
          <div className="text-xs uppercase tracking-wide">Current Speed (T/S)</div>
        </div>
        <div className="border-2 border-black p-4 text-center">
          <div className="text-xl font-bold mb-1">{timeElapsed.toFixed(1)}s</div>
          <div className="text-xs uppercase tracking-wide">Time Elapsed</div>
        </div>
        <div className="border-2 border-black p-4 text-center">
          <div className="text-xl font-bold mb-1">{progress}%</div>
          <div className="text-xs uppercase tracking-wide">Progress</div>
        </div>
      </div>
    </div>
  );
}

