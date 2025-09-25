import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { CalendarCheck, ClipboardCheck, ClipboardList, Copy, Info, Lightbulb, ListChecks } from 'lucide-react';

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary', error);
      setCopied(false);
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

          <section className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
              <Info className="h-4 w-4" />
              <span>Prep tip</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Share the copied summary with attendees ahead of time so questions and risks surface before the meeting begins. It
              keeps live sessions focused on decisions rather than context setting.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MeetingPrepAssistant;
