export const STORAGE_KEY = 'helpful-tools-voting-app';

export const SCHEMA_OPTIONS = {
  '1-10': {
    label: 'Score from 1 to 10',
    values: Array.from({ length: 10 }, (_, index) => index + 1),
  },
  '5-stars': {
    label: 'Five Star Rating',
    values: Array.from({ length: 5 }, (_, index) => index + 1),
  },
};

export const defaultVotingConfig = {
  theme: '',
  participantCount: 3,
  rounds: 3,
  schema: '1-10',
  participantNames: ['Participant 1', 'Participant 2', 'Participant 3'],
};

export function normalizeVotingConfig(input) {
  const participantCount = Math.max(1, Number(input.participantCount) || 1);
  const rounds = Math.max(1, Number(input.rounds) || 1);
  const schemaKey = SCHEMA_OPTIONS[input.schema] ? input.schema : '1-10';

  const participantNames = Array.from({ length: participantCount }, (_, index) => {
    const name = input.participantNames?.[index];
    return name?.trim() ? name.trim() : `Participant ${index + 1}`;
  });

  return {
    ...defaultVotingConfig,
    ...input,
    participantCount,
    rounds,
    schema: schemaKey,
    participantNames,
  };
}

export function createEmptyVotes(rounds, participants) {
  return Array.from({ length: rounds }, () =>
    Array.from({ length: participants }, () => null)
  );
}

export function createStartedVotingSession(config) {
  return {
    votes: createEmptyVotes(config.rounds, config.participantCount),
    currentRound: 0,
    currentParticipant: 0,
    isSessionActive: true,
    awaitingNextRound: false,
    sessionComplete: false,
  };
}

export function validateVotingConfig(config) {
  const errors = {};

  if (!config.theme.trim()) {
    errors.theme = 'Please provide a theme for this voting session.';
  }

  if (config.participantCount < 1) {
    errors.participantCount = 'At least one participant is required.';
  }

  if (config.rounds < 1) {
    errors.rounds = 'Please set at least one round.';
  }

  if (!SCHEMA_OPTIONS[config.schema]) {
    errors.schema = 'Please choose a valid voting schema.';
  }

  return errors;
}

export function sanitizeParticipantNames(participantNames) {
  return participantNames.map(
    (name, index) => name?.trim() || `Participant ${index + 1}`
  );
}

export function restoreVotingSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      config: parsed.config ? normalizeVotingConfig(parsed.config) : normalizeVotingConfig(defaultVotingConfig),
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
      currentRound: typeof parsed.currentRound === 'number' ? parsed.currentRound : 0,
      currentParticipant:
        typeof parsed.currentParticipant === 'number' ? parsed.currentParticipant : 0,
      isSessionActive:
        typeof parsed.isSessionActive === 'boolean' ? parsed.isSessionActive : false,
      awaitingNextRound:
        typeof parsed.awaitingNextRound === 'boolean' ? parsed.awaitingNextRound : false,
      sessionComplete:
        typeof parsed.sessionComplete === 'boolean' ? parsed.sessionComplete : false,
    };
  } catch (error) {
    console.error('Failed to restore voting session from storage', error);
    return null;
  }
}

export function persistVotingSession(state) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearVotingSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function applyVoteSelection(votes, currentRound, currentParticipant, value) {
  const nextVotes = votes.map((roundVotes) => [...roundVotes]);
  nextVotes[currentRound][currentParticipant] = value;
  return nextVotes;
}

export function getVotingProgressAfterVote({
  currentRound,
  currentParticipant,
  participantCount,
  rounds,
}) {
  const isLastParticipant = currentParticipant + 1 >= participantCount;
  const isFinalRound = currentRound + 1 >= rounds;

  if (!isLastParticipant) {
    return {
      awaitingNextRound: false,
      currentParticipant: currentParticipant + 1,
      isSessionActive: true,
      sessionComplete: false,
    };
  }

  if (isFinalRound) {
    return {
      awaitingNextRound: false,
      currentParticipant: 0,
      isSessionActive: false,
      sessionComplete: true,
    };
  }

  return {
    awaitingNextRound: true,
    currentParticipant: 0,
    isSessionActive: false,
    sessionComplete: false,
  };
}

export function getRemainingVotesInRound(votes, currentRound, participantCount) {
  if (!votes.length) {
    return participantCount;
  }

  const roundVotes = votes[currentRound] ?? [];
  return roundVotes.filter((vote) => vote === null).length;
}

export function getRoundProgressLabel({
  sessionComplete,
  awaitingNextRound,
  isSessionActive,
  currentRound,
  rounds,
  hasVotes,
}) {
  if (sessionComplete) {
    return 'Voting completed';
  }

  if (awaitingNextRound) {
    return `Round ${currentRound + 1} completed`;
  }

  if (isSessionActive) {
    return `Round ${currentRound + 1} of ${rounds}`;
  }

  if (hasVotes) {
    return `Session paused at round ${currentRound + 1}`;
  }

  return 'Ready to start';
}
