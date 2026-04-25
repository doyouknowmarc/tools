import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { clearProConList, persistProConList, restoreProConList } from '../utils/proConList';

function ItemList({ items, onDelete, emptyText }) {
  if (items.length === 0) {
    return <p className="text-sm italic text-gray-400">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-sm text-gray-800">{item.text}</span>
          <button
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
            className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddItemInput({ value, onChange, onAdd, placeholder }) {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      <button
        onClick={onAdd}
        disabled={!value.trim()}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add
      </button>
    </div>
  );
}

export default function ProConListTool() {
  const [topic, setTopic] = useState('');
  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');
  const [pros, setPros] = useState([]);
  const [cons, setCons] = useState([]);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const saved = restoreProConList();
    if (saved) {
      setTopic(saved.topic);
      setPros(saved.pros);
      setCons(saved.cons);
    }
    setIsRestored(true);
  }, []);

  // Guard on isRestored so this effect never runs with the pre-restore empty state.
  // In React 18 StrictMode, effects are double-invoked; without the guard the persist
  // effect would overwrite localStorage before the restored values are applied.
  useEffect(() => {
    if (!isRestored) return;
    persistProConList({ topic, pros, cons });
  }, [isRestored, topic, pros, cons]);

  const addItem = (text, setter) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item = { id: `${Date.now()}-${Math.random()}`, text: trimmed };
    setter((prev) => [item, ...prev]);
  };

  const deleteItem = (id, setter) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setTopic('');
    setProInput('');
    setConInput('');
    setPros([]);
    setCons([]);
    clearProConList();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pro &amp; Con List</h2>
          <p className="text-sm text-gray-500">Brainstorm the pros and cons for any decision.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="space-y-1">
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
          Topic or decision
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Should I switch jobs?"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        {topic && (
          <p className="mt-2 text-base font-semibold text-gray-900">{topic}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
            <h3 className="text-sm font-semibold text-gray-900">Pros</h3>
            {pros.length > 0 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {pros.length}
              </span>
            )}
          </div>
          <AddItemInput
            value={proInput}
            onChange={setProInput}
            onAdd={() => {
              addItem(proInput, setPros);
              setProInput('');
            }}
            placeholder="Add a pro…"
          />
          <ItemList
            items={pros}
            onDelete={(id) => deleteItem(id, setPros)}
            emptyText="No pros added yet."
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
            <h3 className="text-sm font-semibold text-gray-900">Cons</h3>
            {cons.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {cons.length}
              </span>
            )}
          </div>
          <AddItemInput
            value={conInput}
            onChange={setConInput}
            onAdd={() => {
              addItem(conInput, setCons);
              setConInput('');
            }}
            placeholder="Add a con…"
          />
          <ItemList
            items={cons}
            onDelete={(id) => deleteItem(id, setCons)}
            emptyText="No cons added yet."
          />
        </div>
      </div>
    </div>
  );
}
