import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Copy, Heart, PenSquare, Sparkles, Wand2 } from 'lucide-react';

const TONES = [
  {
    id: 'formal',
    label: 'Formal',
    description: 'Polished business tone with full sentences and courtesy cues.'
  },
  {
    id: 'friendly',
    label: 'Friendly',
    description: 'Warm, conversational voice with upbeat energy.'
  },
  {
    id: 'concise',
    label: 'Concise',
    description: 'Direct and trimmed down to essentials.'
  },
  {
    id: 'supportive',
    label: 'Supportive',
    description: 'Empathetic and reassuring responses for support teams.'
  }
];

function replaceContractions(text) {
  return text
    .replace(/\bI'm\b/gi, 'I am')
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\bwe'll\b/gi, 'we will')
    .replace(/\bthat's\b/gi, 'that is')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\byou're\b/gi, 'you are');
}

function friendlyContractions(text) {
  return text
    .replace(/\bwe are\b/gi, "we're")
    .replace(/\bwe will\b/gi, "we'll")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't");
}

function stripFiller(text) {
  return text
    .replace(/\b(just|really|very|actually|basically|kind of|sort of)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s([,.!?])/g, '$1')
    .trim();
}

function ensurePunctuation(text) {
  return text.replace(/([a-zA-Z0-9])\s*$/g, '$1.');
}

function applyTone(text, tone) {
  if (!text.trim()) return '';
  let output = text.trim();

  switch (tone) {
    case 'formal': {
      output = replaceContractions(output);
      output = output.replace(/!+/g, '.');
      output = ensurePunctuation(output);
      if (!/thank/i.test(output)) {
        output = `${output} Thank you for your time.`;
      }
      break;
    }
    case 'friendly': {
      output = friendlyContractions(output);
      if (!/\bthanks\b/i.test(output)) {
        output = `${output} Thanks a ton!`;
      }
      output = output.replace(/\./g, '!');
      break;
    }
    case 'concise': {
      output = stripFiller(output);
      output = output.replace(/\s+/g, ' ');
      output = output.replace(/([.!?])\s*(?=[.!?])/g, '$1 ');
      break;
    }
    case 'supportive': {
      output = replaceContractions(output);
      if (!/\bthank/i.test(output)) {
        output = `${output} Thank you for letting us know.`;
      }
      output = `${'I understand how frustrating this can feel. '} ${output}`;
      output = output.replace(/!+/g, '.');
      break;
    }
    default:
      break;
  }

  return output.trim();
}

function analyseText(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? text.trim().split(/[.!?]+/).filter(Boolean).length : 0;
  const readingTime = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
  return { words, sentences, readingTime };
}

function ContentToneAdjuster() {
  const [source, setSource] = useState('Thanks for waiting! We are still looking into the billing issue and will get back shortly.');
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [copied, setCopied] = useState(false);

  const adjusted = useMemo(() => applyTone(source, selectedTone.id), [source, selectedTone.id]);
  const metrics = useMemo(() => analyseText(source), [source]);

  const copyAdjusted = async () => {
    try {
      await navigator.clipboard.writeText(adjusted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy tone adjusted text', error);
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2 rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <PenSquare className="h-4 w-4" />
              <span>Original copy</span>
            </label>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              rows={12}
              className="mt-3 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tone presets</p>
            <div className="mt-2 grid gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={clsx(
                    'rounded-lg border px-3 py-2 text-left transition',
                    selectedTone.id === tone.id
                      ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  )}
                >
                  <p className="text-sm font-semibold">{tone.label}</p>
                  <p className="text-xs text-gray-400">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50/70 border border-gray-200 p-3 text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Input snapshot</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{metrics.words} words</span>
              <span>{metrics.sentences} sentences</span>
              <span>{metrics.readingTime} min read</span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Wand2 className="h-4 w-4" />
                <span>Adjusted copy</span>
              </h2>
              <button
                type="button"
                onClick={copyAdjusted}
                className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400"
                disabled={!adjusted}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied!' : 'Copy output'}</span>
              </button>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-800 leading-relaxed min-h-[160px] whitespace-pre-wrap">
              {adjusted || 'Start typing to generate a rewrite.'}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Guidance</span>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>• Tailor the presets to align with your brand voice.</li>
                <li>• Use the copy button to paste into help desks or marketing drafts.</li>
                <li>• Keep source text short for clearer transformations.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Suggested follow ups</span>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {selectedTone.id === 'formal' && (
                  <li>• Add specifics about next steps or deadlines to reinforce clarity.</li>
                )}
                {selectedTone.id === 'friendly' && (
                  <li>• Sprinkle in emojis sparingly if your channel allows.</li>
                )}
                {selectedTone.id === 'concise' && (
                  <li>• Consider bullet points for multi-step instructions.</li>
                )}
                {selectedTone.id === 'supportive' && (
                  <li>• Offer an optional call or extra resource link to go the extra mile.</li>
                )}
                <li>• Review before sending—automatic tone shifts may need personal tweaks.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContentToneAdjuster;
