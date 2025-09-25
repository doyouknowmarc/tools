import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Braces, Highlighter, Info } from 'lucide-react';

const FLAG_OPTIONS = [
  { id: 'g', label: 'Global', description: 'Find every match in the string.' },
  { id: 'i', label: 'Ignore case', description: 'Case insensitive matching.' },
  { id: 'm', label: 'Multiline', description: 'Treat ^ and $ as start/end of each line.' },
  { id: 's', label: 'Dotall', description: 'Allow . to match newline characters.' },
  { id: 'u', label: 'Unicode', description: 'Enable full Unicode mode.' },
  { id: 'y', label: 'Sticky', description: 'Match from the last index position only.' }
];

const TOKEN_HELP = {
  '^': 'Start of string (or line with multiline flag).',
  '$': 'End of string (or line with multiline flag).',
  '.': 'Any character except newline (unless dotall flag is set).',
  '\\d': 'Digit character (0-9).',
  '\\D': 'Not a digit.',
  '\\w': 'Word character (letters, digits, underscore).',
  '\\W': 'Not a word character.',
  '\\s': 'Whitespace character.',
  '\\S': 'Non-whitespace character.',
  '+': 'One or more of the previous token.',
  '*': 'Zero or more of the previous token.',
  '?': 'Zero or one of the previous token (or makes quantifiers lazy).',
  '{': 'Start of a quantifier block, e.g., {2,4}.',
  '[': 'Start of a character class (set).',
  ']': 'End of a character class.',
  '(': 'Start of a capturing group.',
  ')': 'End of a capturing group.',
  '|': 'Alternation (OR).',
  '\\b': 'Word boundary assertion.',
  '\\B': 'Non-word boundary assertion.'
};

const DEFAULT_SAMPLE = `Example input:\n- Ticket ABC-123 assigned to alice@example.com\n- Ticket XYZ-9 waiting on QA`;

function escapeHtml(text) {
  return text.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
}

function highlightMatches(sample, regex) {
  if (!regex || !sample) return sample;
  let lastIndex = 0;
  let result = '';
  const text = sample;
  const globalRegex = regex.global ? regex : new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  globalRegex.lastIndex = 0;
  let match;
  while ((match = globalRegex.exec(text)) !== null) {
    const start = match.index;
    const end = start + (match[0]?.length ?? 0);
    const before = escapeHtml(text.slice(lastIndex, start));
    const content = escapeHtml(text.slice(start, end));
    result += `${before}<mark class="bg-amber-200 px-0.5 rounded">${content}</mark>`;
    lastIndex = end;
    if (match[0]?.length === 0) {
      globalRegex.lastIndex += 1;
    }
  }
  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function tokenizePattern(pattern) {
  if (!pattern) return [];
  const tokens = [];
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    let token = char;
    if (char === '\\' && index + 1 < pattern.length) {
      token = `${char}${pattern[index + 1]}`;
      index += 1;
    }
    if (token.trim() === '') continue;
    if (tokens.length && tokens[tokens.length - 1].value === '{' && token === '}') {
      tokens.push({ value: '…', explanation: 'Quantifier range content.' });
    }
    tokens.push({
      value: token,
      explanation: TOKEN_HELP[token] ?? 'Literal character match.'
    });
  }
  return tokens;
}

function RegexTester() {
  const [pattern, setPattern] = useState('([A-Z]{3}-\\d{1,4})');
  const [sample, setSample] = useState(DEFAULT_SAMPLE);
  const [flags, setFlags] = useState(['g']);

  const flagString = useMemo(() => flags.join(''), [flags]);

  const { regex, error } = useMemo(() => {
    try {
      return { regex: new RegExp(pattern, flagString), error: null };
    } catch (creationError) {
      return {
        regex: null,
        error:
          creationError instanceof Error
            ? creationError.message
            : 'Invalid regular expression.'
      };
    }
  }, [pattern, flagString]);

  const matches = useMemo(() => {
    if (!regex || !sample) return [];
    const list = [];
    if (!regex.global) {
      const match = regex.exec(sample);
      if (match) {
        list.push({ match: match[0], index: match.index, groups: match.slice(1) });
      }
    } else {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(sample)) !== null) {
        list.push({ match: match[0], index: match.index, groups: match.slice(1) });
        if (match[0]?.length === 0) {
          regex.lastIndex += 1;
        }
      }
    }
    return list;
  }, [regex, sample]);

  const highlightedSample = useMemo(() => {
    if (!regex) return escapeHtml(sample);
    try {
      return highlightMatches(sample, regex);
    } catch (highlightError) {
      console.error('Failed to highlight matches', highlightError);
      return escapeHtml(sample);
    }
  }, [regex, sample]);

  const tokens = useMemo(() => tokenizePattern(pattern), [pattern]);

  const toggleFlag = (flag) => {
    setFlags((current) =>
      current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2 rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Braces className="h-4 w-4" />
              <span>Regular expression</span>
            </label>
            <input
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-gray-400 focus:outline-none"
              placeholder="e.g. (foo|bar)\\d+"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Flags</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FLAG_OPTIONS.map((flag) => (
                <button
                  key={flag.id}
                  type="button"
                  onClick={() => toggleFlag(flag.id)}
                  className={clsx(
                    'rounded-lg border px-3 py-2 text-left transition',
                    flags.includes(flag.id)
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  <p className="text-sm font-semibold">/{flag.id}</p>
                  <p className="text-xs text-gray-400">{flag.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">Sample text</label>
            <textarea
              value={sample}
              onChange={(event) => setSample(event.target.value)}
              rows={10}
              className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm font-mono focus:border-gray-400 focus:outline-none"
            />
          </div>
        </section>

        <section className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Highlighter className="h-4 w-4" />
                <span>Matches</span>
              </h2>
            </div>

            {error && (
              <div className="mt-4 flex items-start space-x-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Invalid regex</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!error && (
              <>
                <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedSample }} />

                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  {matches.length === 0 ? (
                    <p>No matches yet. Adjust your pattern or sample.</p>
                  ) : (
                    matches.map((item, index) => (
                      <div key={`${item.match}-${item.index}-${index}`} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-gray-900">{item.match}</span>
                          <span className="text-xs text-gray-400">index {item.index}</span>
                        </div>
                        {item.groups.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-gray-500">
                            {item.groups.map((group, groupIndex) => (
                              <li key={groupIndex}>
                                Group {groupIndex + 1}:{' '}
                                <span className="font-mono text-gray-700">{group ?? '—'}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Pattern explainer</span>
            </h2>
            {tokens.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">Start typing a pattern to see breakdown hints.</p>
            ) : (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {tokens.map((token, index) => (
                  <li key={`${token.value}-${index}`} className="rounded-lg border border-gray-200 p-3">
                    <p className="font-mono text-sm font-semibold text-gray-900">{token.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{token.explanation}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RegexTester;
