import React, { useEffect, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

function CounterTool() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 200);
    return () => clearTimeout(timeout);
  }, [count]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Simple Counter</h2>
          <p className="text-sm text-gray-500">Tap to adjust the value and keep track effortlessly.</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-gray-400">Current Count</span>
          <div
            className={`mt-4 text-7xl font-semibold tabular-nums text-gray-900 transition-transform duration-150 sm:text-8xl ${
              isAnimating ? 'animate-count-confirmation' : ''
            }`}
          >
            {count}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
          <button
            type="button"
            onClick={decrement}
            aria-label="Subtract one"
            className="flex h-28 w-full max-w-sm items-center justify-center rounded-3xl bg-gray-100 text-4xl font-semibold text-gray-700 transition-all hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 active:scale-95 sm:text-5xl"
          >
            <Minus className="h-12 w-12" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={increment}
            aria-label="Add one"
            className="flex h-28 w-full max-w-sm items-center justify-center rounded-3xl bg-gray-900 text-4xl font-semibold text-white transition-all hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 active:scale-95 sm:text-5xl"
          >
            <Plus className="h-12 w-12" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CounterTool;
