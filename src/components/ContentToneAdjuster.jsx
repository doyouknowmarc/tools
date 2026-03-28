import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  AlertTriangle,
  Copy,
  Heart,
  Info,
  Loader2,
  PenSquare,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useOllamaSession } from '../hooks/useOllamaSession';
import {
  analyseText,
  applyTone,
  buildToneRemotePrompt,
  TONES,
} from '../utils/toneAdjuster';

function ContentToneAdjuster() {
  const [source, setSource] = useState(
    'Thanks for waiting! We are still looking into the billing issue and will get back shortly.'
  );
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [copied, setCopied] = useState(false);
  const {
    generatedText: remoteAdjusted,
    generationError: remoteError,
    hasRemoteConnection,
    isGenerating,
    loadModels,
    models,
    modelsMessage,
    ollamaHost,
    selectedModel,
    setOllamaHost,
    setSelectedModel,
    generateText,
    resetGeneratedText,
  } = useOllamaSession({ taskLabel: 'rewrites' });

  const adjusted = useMemo(
    () => applyTone(source, selectedTone.id),
    [source, selectedTone.id]
  );
  const metrics = useMemo(() => analyseText(source), [source]);

  const copyAdjusted = async () => {
    try {
      await navigator.clipboard.writeText(remoteAdjusted || adjusted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy tone adjusted text', error);
      setCopied(false);
    }
  };

  const generateWithOllama = async () => {
    resetGeneratedText();

    await generateText({
      prompt: buildToneRemotePrompt(selectedTone, source),
      missingPromptMessage: 'Provide some text before requesting a rewrite.',
      missingModelMessage: 'Select a model to generate a rewrite.',
      requestFailureMessage: 'Unable to generate a rewrite.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 rounded-xl border border-gray-200 p-4 lg:col-span-2">
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tone presets
            </p>
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
            {modelsMessage ? <p className="text-xs text-gray-500">{modelsMessage}</p> : null}
            <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              <p className="font-semibold">Start Ollama for the web app</p>
              <p>Paste this snippet into your terminal, then refresh the models list:</p>
              <pre className="whitespace-pre-wrap rounded bg-amber-100/60 p-2 font-mono text-[11px] text-amber-900">
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="https://doyouknowmarc.github.io"
ollama serve
              </pre>
              <p>Swap the origin for your local dev URL if needed.</p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/70 p-3 text-sm text-gray-600">
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

        <section className="space-y-4 lg:col-span-3">
          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                  <Wand2 className="h-4 w-4" />
                  <span>Streamed rewrite from Ollama</span>
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Ollama handles the heavy lifting. Pick a template and stream the
                  polished draft here.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={generateWithOllama}
                  className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 disabled:opacity-60"
                  disabled={!selectedModel || isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
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
              className="min-h-[160px] whitespace-pre-wrap rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-800"
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
            {remoteError ? <p className="text-xs text-red-500">{remoteError}</p> : null}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <Sparkles className="h-4 w-4" />
              <span>Quick local tweak</span>
            </h3>
            <p className="mt-2 text-xs text-gray-500">
              This offline helper mirrors the selected template while you wait for
              Ollama or when you are editing without a model.
            </p>
            <div className="mt-3 min-h-[120px] whitespace-pre-wrap rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-700">
              {adjusted || 'Start typing to preview the local transformation.'}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
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
              <h3 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                <Heart className="h-4 w-4" />
                <span>Suggested follow ups</span>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {selectedTone.id === 'formal' ? (
                  <li>• Add specifics about next steps or deadlines to reinforce clarity.</li>
                ) : null}
                {selectedTone.id === 'friendly' ? (
                  <li>• Sprinkle in emojis sparingly if your channel allows.</li>
                ) : null}
                {selectedTone.id === 'concise' ? (
                  <li>• Consider bullet points for multi-step instructions.</li>
                ) : null}
                {selectedTone.id === 'grammar' ? (
                  <li>• Double-check names and product jargon after grammar clean-up.</li>
                ) : null}
                {selectedTone.id === 'supportive' ? (
                  <li>• Offer an optional call or extra resource link to go the extra mile.</li>
                ) : null}
                <li>• Review before sending. Automatic tone shifts may need personal tweaks.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContentToneAdjuster;
