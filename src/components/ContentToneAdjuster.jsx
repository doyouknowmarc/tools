import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  AlertTriangle,
  Copy,
  Heart,
  Info,
  Loader2,
  PenSquare,
  Sparkles,
  Wand2
} from 'lucide-react';
import { readOllamaStream } from '../utils/ollama';

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
    id: 'grammar',
    label: 'Grammar polish',
    description: 'Fix typos and grammar without changing the voice.'
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
    case 'grammar': {
      output = output.replace(/\s+/g, ' ');
      output = ensurePunctuation(output);
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

function buildRemotePrompt(tone, sourceText) {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    return '';
  }

  if (tone.id === 'grammar') {
    return `You are a meticulous copy editor. Correct grammar, spelling, and punctuation errors in the message below while preserving the original intent, voice, and formatting. Return the cleaned version only.\n\nMessage:\n${trimmed}\n\nCorrected message:`;
  }

  return `You are an expert communications assistant. Rewrite the message below so it matches a ${tone.label.toLowerCase()} tone. Retain all key facts, keep it concise, and respond with text ready to paste.\n\nMessage:\n${trimmed}\n\nRewritten message:`;
}

function ContentToneAdjuster() {
  const [source, setSource] = useState('Thanks for waiting! We are still looking into the billing issue and will get back shortly.');
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [copied, setCopied] = useState(false);
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [models, setModels] = useState([]);
  const [modelsMessage, setModelsMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [remoteAdjusted, setRemoteAdjusted] = useState('');
  const [remoteError, setRemoteError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const adjusted = useMemo(() => applyTone(source, selectedTone.id), [source, selectedTone.id]);
  const metrics = useMemo(() => analyseText(source), [source]);
  const normalisedHost = useMemo(() => ollamaHost.trim().replace(/\/$/, ''), [ollamaHost]);
  const hasRemoteConnection = Boolean(models.length);

  useEffect(() => {
    if (!models.length) return;
    if (!selectedModel) {
      const first = models[0];
      const name = first?.name || first?.model || '';
      setSelectedModel(name);
    } else if (!models.some((model) => (model.name || model.model) === selectedModel)) {
      setSelectedModel('');
    }
  }, [models, selectedModel]);

  const copyAdjusted = async () => {
    try {
      await navigator.clipboard.writeText(remoteAdjusted || adjusted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy tone adjusted text', error);
      setCopied(false);
    }
  };

  const loadModels = async () => {
    if (!normalisedHost) {
      setModelsMessage('Enter the Ollama address to load models.');
      return;
    }

    try {
      setModelsMessage('Connecting to Ollama…');
      const response = await fetch(`${normalisedHost}/api/tags`);
      if (!response.ok) {
        throw new Error(`Model request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data.models)) {
        throw new Error('Unexpected response payload.');
      }
      setModels(data.models);
      if (!data.models.length) {
        setModelsMessage('No models available on the Ollama server. Pull one with "ollama pull" then refresh.');
      } else {
        setModelsMessage(
          `Ready – ${data.models.length} model${data.models.length === 1 ? '' : 's'} found. Select one to stream rewrites.`
        );
      }
    } catch (error) {
      console.error('Failed to load Ollama models', error);
      setModels([]);
      setSelectedModel('');
      setModelsMessage(error.message || 'Unable to reach Ollama.');
    }
  };

  const generateWithOllama = async () => {
    if (!source.trim()) {
      setRemoteError('Provide some text before requesting a rewrite.');
      return;
    }
    if (!selectedModel) {
      setRemoteError('Select a model to generate a rewrite.');
      return;
    }

    const prompt = buildRemotePrompt(selectedTone, source);
    if (!prompt) {
      setRemoteError('Provide some text before requesting a rewrite.');
      return;
    }

    try {
      setIsGenerating(true);
      setRemoteError('');
      setRemoteAdjusted('');
      const response = await fetch(`${normalisedHost}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Rewrite failed with status ${response.status}`);
      }

      const final = await readOllamaStream(response, (delta) => {
        setRemoteAdjusted((prev) => prev + delta);
      });
      setRemoteAdjusted(final);
    } catch (error) {
      console.error('Failed to generate rewrite', error);
      setRemoteError(error.message || 'Unable to generate a rewrite.');
    } finally {
      setIsGenerating(false);
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

          <div className="space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-3">
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Info className="h-4 w-4" />
              <span>Connect to Ollama</span>
            </div>
            <label className="text-xs font-medium text-gray-500">
              Base URL
              <input
                value={ollamaHost}
                onChange={(event) => setOllamaHost(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                placeholder="http://localhost:11434"
              />
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={loadModels}
                className="inline-flex items-center space-x-2 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400"
              >
                <span>Refresh models</span>
              </button>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                disabled={!models.length}
              >
                <option value="">
                  {models.length ? 'Select a model' : 'Load models to choose'}
                </option>
                {models.map((model) => {
                  const name = model.name || model.model;
                  return (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
            {modelsMessage && <p className="text-xs text-gray-500">{modelsMessage}</p>}
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 space-y-2">
              <p className="font-semibold">Start Ollama for the web app</p>
              <p>Paste this snippet into your terminal, then refresh the models list:</p>
              <pre className="whitespace-pre-wrap rounded bg-amber-100/60 p-2 font-mono text-[11px] text-amber-900">
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="https://doyouknowmarc.github.io"
ollama serve
              </pre>
              <p>Swap the origin for your local dev URL if needed.</p>
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
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Wand2 className="h-4 w-4" />
                  <span>Streamed rewrite from Ollama</span>
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Ollama handles the heavy lifting—pick a template and stream the polished draft here.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={generateWithOllama}
                  className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 disabled:opacity-60"
                  disabled={!selectedModel || isGenerating}
                >
                  {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isGenerating ? 'Streaming…' : 'Stream rewrite'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyAdjusted}
                  className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400"
                  disabled={!(remoteAdjusted || adjusted)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>
                    {copied
                      ? 'Copied!'
                      : remoteAdjusted
                      ? 'Copy streamed draft'
                      : 'Copy local tweak'}
                  </span>
                </button>
              </div>
            </div>
            <div
              className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-800 leading-relaxed min-h-[160px] whitespace-pre-wrap"
              aria-live="polite"
            >
              {remoteAdjusted
                ? remoteAdjusted
                : isGenerating
                ? 'Streaming response from Ollama…'
                : selectedModel
                ? 'Click "Stream rewrite" to generate a fresh draft from Ollama.'
                : hasRemoteConnection
                ? 'Select a model to begin streaming rewrites from Ollama.'
                : 'Connect to Ollama above, load models, and choose one to stream rewrites.'}
            </div>
            {remoteError && <p className="text-xs text-red-500">{remoteError}</p>}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Quick local tweak</span>
            </h3>
            <p className="mt-2 text-xs text-gray-500">
              This offline helper mirrors the selected template while you wait for Ollama or when you are editing without a model.
            </p>
            <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-700 min-h-[120px] whitespace-pre-wrap">
              {adjusted || 'Start typing to preview the local transformation.'}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Guidance</span>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>• Let Ollama handle heavy rewrites; lean on the local preview for instant tweaks.</li>
                <li>• Tailor the presets to align with your brand voice.</li>
                <li>• Use the copy button to paste into help desks or marketing drafts.</li>
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
                {selectedTone.id === 'grammar' && (
                  <li>• Double-check names and product jargon after grammar clean-up.</li>
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
