import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Info,
  Lightbulb,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { useOllamaSession } from '../hooks/useOllamaSession';
import {
  buildMeetingSummary,
  deriveFollowUps,
  deriveObjectives,
  deriveQuestions,
  extractTopics,
  MEETING_TYPES,
  normaliseLines,
} from '../utils/meetingPrep';

function MeetingPrepAssistant() {
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [agenda, setAgenda] = useState('');
  const [copied, setCopied] = useState(false);
  const [remoteCopied, setRemoteCopied] = useState(false);
  const {
    generatedText: remoteSummary,
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
  } = useOllamaSession({ taskLabel: 'briefings' });

  const lines = useMemo(() => normaliseLines(agenda), [agenda]);
  const topics = useMemo(() => extractTopics(lines), [lines]);
  const objectives = useMemo(
    () => deriveObjectives(topics, meetingType.id),
    [topics, meetingType.id]
  );
  const questions = useMemo(
    () => deriveQuestions(topics, meetingType.id),
    [topics, meetingType.id]
  );
  const followUps = useMemo(
    () => deriveFollowUps(topics, meetingType.id),
    [topics, meetingType.id]
  );
  const summaryText = useMemo(
    () =>
      buildMeetingSummary({
        meetingLabel: meetingType.label,
        objectives,
        questions,
        followUps,
      }),
    [followUps, meetingType.label, objectives, questions]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remoteSummary || summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary', error);
      setCopied(false);
    }
  };

  const copyRemoteSummary = async () => {
    if (!remoteSummary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(remoteSummary);
      setRemoteCopied(true);
      window.setTimeout(() => setRemoteCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy briefing', error);
      setRemoteCopied(false);
    }
  };

  const generateWithOllama = async () => {
    setRemoteCopied(false);
    resetGeneratedText();

    const prompt = `You are a chief of staff preparing an executive briefing for a ${meetingType.label.toLowerCase()}. Using the draft notes below, produce a succinct agenda with objectives, questions, and follow-ups ready to paste into an email. Use bullet lists where it helps readability.\n\nDraft notes:\n${summaryText}\n\nBriefing:`;

    await generateText({
      prompt,
      missingPromptMessage: 'Add some agenda details first.',
      missingModelMessage: 'Select a model to create a briefing.',
      requestFailureMessage: 'Unable to generate a meeting briefing.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 p-4">
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <ClipboardList className="h-4 w-4" />
              <span>Agenda</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Paste your draft agenda, bullet list, or meeting notes. We will surface
              goals, key questions, and follow-ups for you.
            </p>
            <textarea
              value={agenda}
              onChange={(event) => setAgenda(event.target.value)}
              rows={12}
              className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-800 focus:border-gray-400 focus:outline-none"
              placeholder="- Roadmap checkpoint
- Risk review for payments
- Demo latest release candidate"
            />
          </section>

          <section className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <CalendarCheck className="h-4 w-4" />
              <span>Meeting template</span>
            </h2>
            <p className="text-sm text-gray-500">
              Choose the meeting flavour to tailor the prompts and recommended
              follow-ups.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {MEETING_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setMeetingType(type)}
                  className={clsx(
                    'rounded-lg border px-3 py-2 text-left transition',
                    meetingType.id === type.id
                      ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  )}
                >
                  <p className="text-sm font-semibold">{type.label}</p>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
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
              <p>Paste this into your terminal, then reload the model list:</p>
              <pre className="whitespace-pre-wrap rounded bg-amber-100/60 p-2 font-mono text-[11px] text-amber-900">
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="https://doyouknowmarc.github.io"
ollama serve
              </pre>
              <p>Update the origin if you are running the UI from another host or port.</p>
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                <Lightbulb className="h-4 w-4" />
                <span>Objectives to highlight</span>
              </h2>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied!' : 'Copy summary'}</span>
              </button>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {objectives.map((objective) => (
                <li key={objective} className="flex items-start space-x-2">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <ListChecks className="h-4 w-4" />
              <span>Key questions to ask</span>
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {questions.map((question) => (
                <li key={question} className="flex items-start space-x-2">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
              <ClipboardCheck className="h-4 w-4" />
              <span>Suggested follow-ups</span>
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {followUps.map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Lightbulb className="h-4 w-4" />
                  <span>Ollama briefing stream</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Let Ollama condense your notes into an executive-ready update,
                  streamed line by line.
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
                  <span>{isGenerating ? 'Streaming…' : 'Stream briefing'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyRemoteSummary}
                  className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400"
                  disabled={!remoteSummary}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{remoteCopied ? 'Copied!' : 'Copy briefing'}</span>
                </button>
              </div>
            </div>
            <div
              className="min-h-[160px] whitespace-pre-wrap rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-700"
              aria-live="polite"
            >
              {remoteSummary
                ? remoteSummary
                : isGenerating
                ? 'Streaming briefing from Ollama…'
                : selectedModel
                ? 'Click "Stream briefing" to generate an executive-ready summary.'
                : hasRemoteConnection
                ? 'Select a model to start streaming your meeting briefing.'
                : 'Connect to Ollama above, load models, and choose one to stream your briefing.'}
            </div>
            {remoteError ? <p className="text-xs text-red-500">{remoteError}</p> : null}
            {!remoteSummary ? (
              <p className="text-xs text-gray-500">
                Share the generated summary with attendees ahead of time so questions
                and risks surface before the meeting begins.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default MeetingPrepAssistant;
