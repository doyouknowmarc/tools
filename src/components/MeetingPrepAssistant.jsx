import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Info,
  Lightbulb,
  ListChecks,
  Loader2
} from 'lucide-react';

const MEETING_TYPES = [
  {
    id: 'status',
    label: 'Status Update',
    description: 'Keep the team aligned on ongoing work and risks.'
  },
  {
    id: 'planning',
    label: 'Planning / Kickoff',
    description: 'Clarify scope, responsibilities, and milestones.'
  },
  {
    id: 'retro',
    label: 'Retro / Post-mortem',
    description: 'Reflect on what worked, what did not, and next steps.'
  }
];

function normaliseLines(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractTopics(lines) {
  if (!lines.length) return [];
  return lines.map((line) => {
    const withoutPrefix = line.replace(/^[-*\d.\s]+/, '').trim();
    if (!withoutPrefix) return line;
    return withoutPrefix;
  });
}

function sentenceCase(text) {
  if (!text) return '';
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function deriveObjectives(topics, type) {
  if (!topics.length) {
    return [
      type === 'retro'
        ? 'Set the stage: outline the goal of this retro and desired outcomes.'
        : 'Clarify the primary objective of the meeting so everyone is aligned.'
    ];
  }

  return topics.slice(0, 4).map((topic) => {
    if (type === 'retro') {
      return `Reflect on how ${topic.toLowerCase()} impacted the sprint.`;
    }
    if (type === 'planning') {
      return `Define success criteria for ${topic.toLowerCase()}.`;
    }
    return `Share current progress and blockers for ${topic.toLowerCase()}.`;
  });
}

function deriveQuestions(topics, type) {
  if (!topics.length) {
    return [
      'What would make this meeting a success for everyone attending?',
      'Are there any blockers we should surface early?'
    ];
  }

  const base = topics.slice(0, 5).map((topic) => {
    if (/\?$/.test(topic)) {
      return sentenceCase(topic);
    }

    if (type === 'retro') {
      return `What went well regarding ${topic.toLowerCase()}?`;
    }
    if (type === 'planning') {
      return `What assumptions are we making about ${topic.toLowerCase()}?`;
    }
    return `Is anything at risk for ${topic.toLowerCase()}?`;
  });

  if (type === 'retro') {
    base.push('What experiments should we try next iteration?');
  } else if (type === 'planning') {
    base.push('What milestones do we need to communicate broadly?');
  } else {
    base.push('Are there dependencies we need to flag to other teams?');
  }

  return base;
}

function deriveFollowUps(topics, type) {
  const placeholder =
    type === 'planning'
      ? 'Capture owners and deadlines for every deliverable discussed.'
      : type === 'retro'
      ? 'Document action items with clear owners and review them next retro.'
      : 'Summarise key decisions and share notes within 24 hours.';

  if (!topics.length) {
    return [placeholder];
  }

  const followUps = topics.slice(0, 4).map((topic) => {
    if (type === 'retro') {
      return `Create an improvement task for ${topic.toLowerCase()} and assign an owner.`;
    }
    if (type === 'planning') {
      return `Draft a work-back plan covering ${topic.toLowerCase()}.`;
    }
    return `Log an update in the project tracker for ${topic.toLowerCase()}.`;
  });

  followUps.push(placeholder);
  return followUps;
}

function MeetingPrepAssistant() {
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [agenda, setAgenda] = useState('');
  const [copied, setCopied] = useState(false);
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [models, setModels] = useState([]);
  const [modelsMessage, setModelsMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [remoteSummary, setRemoteSummary] = useState('');
  const [remoteError, setRemoteError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const summaryText = useMemo(() => {
    const sections = [
      `Meeting type: ${meetingType.label}`,
      '',
      'Objectives:',
      ...objectives.map((item) => `- ${item}`),
      '',
      'Key questions:',
      ...questions.map((item) => `- ${item}`),
      '',
      'Follow-ups:',
      ...followUps.map((item) => `- ${item}`)
    ];
    return sections.join('\n');
  }, [followUps, meetingType.label, objectives, questions]);

  const normalisedHost = useMemo(() => ollamaHost.trim().replace(/\/$/, ''), [ollamaHost]);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remoteSummary || summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary', error);
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
        setModelsMessage('No models available on the Ollama server.');
      } else {
        setModelsMessage(`Loaded ${data.models.length} model${data.models.length === 1 ? '' : 's'}.`);
      }
    } catch (error) {
      console.error('Failed to load Ollama models', error);
      setModels([]);
      setSelectedModel('');
      setModelsMessage(error.message || 'Unable to reach Ollama.');
    }
  };

  const generateWithOllama = async () => {
    if (!selectedModel) {
      setRemoteError('Select a model to create a briefing.');
      return;
    }
    if (!summaryText.trim()) {
      setRemoteError('Add some agenda details first.');
      return;
    }

    try {
      setIsGenerating(true);
      setRemoteError('');
      setRemoteSummary('');
      const response = await fetch(`${normalisedHost}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `You are a chief of staff preparing an executive briefing for a ${meetingType.label.toLowerCase()}. Using the draft notes below, produce a succinct agenda with objectives, questions, and follow-ups ready to paste into an email. Use bullet lists where it helps readability.\n\nDraft notes:\n${summaryText}\n\nBriefing:`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Briefing failed with status ${response.status}`);
      }
      const data = await response.json();
      const output = (data.response || data.output || '').trim();
      if (!output) {
        throw new Error('Ollama returned an empty response.');
      }
      setRemoteSummary(output);
    } catch (error) {
      console.error('Failed to generate meeting briefing', error);
      setRemoteError(error.message || 'Unable to generate a meeting briefing.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span>Agenda</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Paste your draft agenda, bullet list, or meeting notes. We will surface goals, key
              questions, and follow-ups for you.
            </p>
            <textarea
              value={agenda}
              onChange={(event) => setAgenda(event.target.value)}
              rows={12}
              className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-800 focus:border-gray-400 focus:outline-none"
              placeholder={
                '- Roadmap checkpoint\n- Risk review for payments\n- Demo latest release candidate'
              }
            />
          </section>

          <section className="rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <CalendarCheck className="h-4 w-4" />
              <span>Meeting template</span>
            </h2>
            <p className="text-sm text-gray-500">
              Choose the meeting flavour to tailor the prompts and recommended follow-ups.
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

          <section className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/60">
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
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              <p className="font-semibold">Allow cross-origin requests</p>
              <p className="mt-1">
                Start Ollama with <code className="font-mono">OLLAMA_ORIGINS="http://localhost:5173"</code> (or the host serving this tool)
                and <code className="font-mono">OLLAMA_HOST=0.0.0.0:11434</code> so the browser can reach it. Restart Ollama after updating the config.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
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
            <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
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
            <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
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

          <section className="rounded-xl border border-gray-200 p-4 bg-gray-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Lightbulb className="h-4 w-4" />
                <span>AI-generated briefing</span>
              </div>
              <button
                type="button"
                onClick={generateWithOllama}
                className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 disabled:opacity-60"
                disabled={!models.length || isGenerating}
              >
                {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isGenerating ? 'Drafting…' : 'Draft with Ollama'}</span>
              </button>
            </div>
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-700 min-h-[160px] whitespace-pre-wrap">
              {remoteSummary || 'Connect to Ollama and click “Draft with Ollama” to generate an executive-ready briefing.'}
            </div>
            {remoteError && <p className="text-xs text-red-500">{remoteError}</p>}
            {!remoteSummary && (
              <p className="text-xs text-gray-500">
                Share the generated summary with attendees ahead of time so questions and risks surface before the meeting
                begins.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default MeetingPrepAssistant;
