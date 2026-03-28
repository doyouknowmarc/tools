export const MEETING_TYPES = [
  {
    id: 'status',
    label: 'Status Update',
    description: 'Keep the team aligned on ongoing work and risks.',
  },
  {
    id: 'planning',
    label: 'Planning / Kickoff',
    description: 'Clarify scope, responsibilities, and milestones.',
  },
  {
    id: 'retro',
    label: 'Retro / Post-mortem',
    description: 'Reflect on what worked, what did not, and next steps.',
  },
];

function sentenceCase(text) {
  if (!text) {
    return '';
  }

  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function normaliseLines(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function extractTopics(lines) {
  if (!lines.length) {
    return [];
  }

  return lines.map((line) => {
    const withoutPrefix = line.replace(/^[-*\d.\s]+/, '').trim();
    return withoutPrefix || line;
  });
}

export function deriveObjectives(topics, type) {
  if (!topics.length) {
    return [
      type === 'retro'
        ? 'Set the stage: outline the goal of this retro and desired outcomes.'
        : 'Clarify the primary objective of the meeting so everyone is aligned.',
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

export function deriveQuestions(topics, type) {
  if (!topics.length) {
    return [
      'What would make this meeting a success for everyone attending?',
      'Are there any blockers we should surface early?',
    ];
  }

  const questions = topics.slice(0, 5).map((topic) => {
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
    questions.push('What experiments should we try next iteration?');
  } else if (type === 'planning') {
    questions.push('What milestones do we need to communicate broadly?');
  } else {
    questions.push('Are there dependencies we need to flag to other teams?');
  }

  return questions;
}

export function deriveFollowUps(topics, type) {
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

export function buildMeetingSummary({ meetingLabel, objectives, questions, followUps }) {
  return [
    `Meeting type: ${meetingLabel}`,
    '',
    'Objectives:',
    ...objectives.map((item) => `- ${item}`),
    '',
    'Key questions:',
    ...questions.map((item) => `- ${item}`),
    '',
    'Follow-ups:',
    ...followUps.map((item) => `- ${item}`),
  ].join('\n');
}
