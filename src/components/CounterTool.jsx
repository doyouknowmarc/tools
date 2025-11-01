import React, { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

function CounterTool() {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

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
          <div className="mt-4 text-7xl font-semibold tabular-nums text-gray-900 sm:text-8xl">{count}</div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={decrement}
            className="flex h-24 w-full max-w-sm items-center justify-center rounded-3xl bg-gray-100 text-4xl font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-[0.98] sm:text-5xl"
          >
            <Minus className="mr-2 h-10 w-10" aria-hidden="true" />
            <span>Subtract</span>
          </button>
          <button
            type="button"
            onClick={increment}
            className="flex h-24 w-full max-w-sm items-center justify-center rounded-3xl bg-gray-900 text-4xl font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98] sm:text-5xl"
          >
            <Plus className="mr-2 h-10 w-10" aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CounterTool;
