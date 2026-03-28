import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Star, Trophy, Users } from 'lucide-react';
import {
  applyVoteSelection,
  clearVotingSession,
  createStartedVotingSession,
  defaultVotingConfig,
  getRemainingVotesInRound,
  getRoundProgressLabel,
  getVotingProgressAfterVote,
  normalizeVotingConfig,
  persistVotingSession,
  restoreVotingSession,
  sanitizeParticipantNames,
  SCHEMA_OPTIONS,
  validateVotingConfig,
} from '../utils/votingSession';

function VotingTool() {
  const [config, setConfig] = useState(() => normalizeVotingConfig(defaultVotingConfig));
  const [votes, setVotes] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentParticipant, setCurrentParticipant] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [awaitingNextRound, setAwaitingNextRound] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const restoredState = restoreVotingSession();
    if (!restoredState) {
      return;
    }

    setConfig(restoredState.config);
    setVotes(restoredState.votes);
    setCurrentRound(restoredState.currentRound);
    setCurrentParticipant(restoredState.currentParticipant);
    setIsSessionActive(restoredState.isSessionActive);
    setAwaitingNextRound(restoredState.awaitingNextRound);
    setSessionComplete(restoredState.sessionComplete);
  }, []);

  useEffect(() => {
    persistVotingSession({
      awaitingNextRound,
      config,
      currentParticipant,
      currentRound,
      isSessionActive,
      sessionComplete,
      votes,
    });
  }, [
    awaitingNextRound,
    config,
    currentParticipant,
    currentRound,
    isSessionActive,
    sessionComplete,
    votes,
  ]);

  const schema = SCHEMA_OPTIONS[config.schema] ?? SCHEMA_OPTIONS['1-10'];

  const completedRounds = useMemo(
    () => votes.filter((roundVotes) => roundVotes.every((vote) => vote !== null)).length,
    [votes]
  );

  const perParticipantAverages = useMemo(() => {
    if (!votes.length) {
      return [];
    }

    return config.participantNames.map((_, participantIndex) => {
      const participantVotes = votes
        .map((roundVotes) => roundVotes[participantIndex])
        .filter((value) => value !== null);

      if (!participantVotes.length) {
        return null;
      }

      const total = participantVotes.reduce((sum, value) => sum + value, 0);
      return total / participantVotes.length;
    });
  }, [config.participantNames, votes]);

  const roundAverages = useMemo(
    () =>
      votes.map((roundVotes) => {
        const filtered = roundVotes.filter((value) => value !== null);
        if (!filtered.length) {
          return null;
        }

        const total = filtered.reduce((sum, value) => sum + value, 0);
        return total / filtered.length;
      }),
    [votes]
  );

  const topPerformerIndex = useMemo(() => {
    if (!perParticipantAverages.length) {
      return null;
    }

    let bestIndex = null;
    let bestAverage = -Infinity;

    perParticipantAverages.forEach((average, index) => {
      if (average !== null && average > bestAverage) {
        bestAverage = average;
        bestIndex = index;
      }
    });

    return bestIndex;
  }, [perParticipantAverages]);

  const isConfigLocked =
    isSessionActive || votes.some((round) => round.some((vote) => vote !== null));

  const overallAverage = useMemo(() => {
    const flattened = votes.flat().filter((value) => value !== null);
    if (!flattened.length) {
      return null;
    }

    const total = flattened.reduce((sum, value) => sum + value, 0);
    return total / flattened.length;
  }, [votes]);

  const handleConfigChange = (field, value) => {
    setConfig((previous) => normalizeVotingConfig({ ...previous, [field]: value }));
  };

  const handleParticipantNameChange = (index, value) => {
    setConfig((previous) => {
      const nextNames = [...previous.participantNames];
      nextNames[index] = value;
      return { ...previous, participantNames: nextNames };
    });
  };

  const handleStartSession = () => {
    const validationErrors = validateVotingConfig(config);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const nextConfig = {
      ...config,
      participantNames: sanitizeParticipantNames(config.participantNames),
    };
    const nextSession = createStartedVotingSession(nextConfig);

    setErrors({});
    setConfig(nextConfig);
    setVotes(nextSession.votes);
    setCurrentRound(nextSession.currentRound);
    setCurrentParticipant(nextSession.currentParticipant);
    setIsSessionActive(nextSession.isSessionActive);
    setAwaitingNextRound(nextSession.awaitingNextRound);
    setSessionComplete(nextSession.sessionComplete);
  };

  const handleSubmitVote = (value) => {
    if (!isSessionActive || awaitingNextRound || sessionComplete) {
      return;
    }

    const nextVotes = applyVoteSelection(votes, currentRound, currentParticipant, value);
    const nextProgress = getVotingProgressAfterVote({
      currentParticipant,
      currentRound,
      participantCount: config.participantCount,
      rounds: config.rounds,
    });

    setVotes(nextVotes);
    setCurrentParticipant(nextProgress.currentParticipant);
    setIsSessionActive(nextProgress.isSessionActive);
    setAwaitingNextRound(nextProgress.awaitingNextRound);
    setSessionComplete(nextProgress.sessionComplete);
  };

  const handleBeginNextRound = () => {
    if (!awaitingNextRound) {
      return;
    }

    setCurrentRound((previous) => previous + 1);
    setCurrentParticipant(0);
    setAwaitingNextRound(false);
    setIsSessionActive(true);
  };

  const handleResetSession = () => {
    clearVotingSession();
    setVotes([]);
    setCurrentRound(0);
    setCurrentParticipant(0);
    setIsSessionActive(false);
    setAwaitingNextRound(false);
    setSessionComplete(false);
    setErrors({});
    setConfig(normalizeVotingConfig(defaultVotingConfig));
  };

  const handleStartNewSession = () => {
    const nextConfig = {
      ...config,
      participantNames: sanitizeParticipantNames(config.participantNames),
    };
    const nextSession = createStartedVotingSession(nextConfig);

    setConfig(nextConfig);
    setVotes(nextSession.votes);
    setCurrentRound(nextSession.currentRound);
    setCurrentParticipant(nextSession.currentParticipant);
    setIsSessionActive(nextSession.isSessionActive);
    setAwaitingNextRound(nextSession.awaitingNextRound);
    setSessionComplete(nextSession.sessionComplete);
  };

  const remainingVotesInRound = useMemo(
    () => getRemainingVotesInRound(votes, currentRound, config.participantCount),
    [config.participantCount, currentRound, votes]
  );

  const nextParticipantName =
    config.participantNames[currentParticipant] || `Participant ${currentParticipant + 1}`;

  const roundProgressLabel = getRoundProgressLabel({
    awaitingNextRound,
    currentRound,
    hasVotes: votes.length > 0,
    isSessionActive,
    rounds: config.rounds,
    sessionComplete,
  });

  const renderRatingLabel = (value) => {
    if (config.schema === '5-stars') {
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: value }, (_, index) => (
            <Star key={index} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500">({value})</span>
        </div>
      );
    }

    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Session Setup</h2>
          <p className="text-sm text-gray-500">
            Configure your interactive voting session. All progress is saved locally.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetSession}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Session theme</label>
            <input
              type="text"
              value={config.theme}
              onChange={(event) => handleConfigChange('theme', event.target.value)}
              disabled={isConfigLocked}
              placeholder="Best craft beer showdown"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
            />
            {errors.theme ? <p className="mt-1 text-sm text-red-600">{errors.theme}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Participants</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <Users className="h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.participantCount}
                  onChange={(event) =>
                    handleConfigChange('participantCount', Number(event.target.value))
                  }
                  disabled={isConfigLocked}
                  className="w-full border-none bg-transparent text-sm focus:outline-none"
                />
              </div>
              {errors.participantCount ? (
                <p className="mt-1 text-sm text-red-600">{errors.participantCount}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rounds</label>
              <input
                type="number"
                min={1}
                max={20}
                value={config.rounds}
                onChange={(event) => handleConfigChange('rounds', Number(event.target.value))}
                disabled={isConfigLocked}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
              />
              {errors.rounds ? <p className="mt-1 text-sm text-red-600">{errors.rounds}</p> : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Voting schema</label>
            <select
              value={config.schema}
              onChange={(event) => handleConfigChange('schema', event.target.value)}
              disabled={isConfigLocked}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
            >
              {Object.entries(SCHEMA_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.schema ? <p className="mt-1 text-sm text-red-600">{errors.schema}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Participant names</label>
            <div className="mt-2 grid gap-2">
              {config.participantNames.map((name, index) => (
                <input
                  key={index}
                  type="text"
                  value={name}
                  onChange={(event) => handleParticipantNameChange(index, event.target.value)}
                  disabled={isConfigLocked}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStartSession}
              disabled={isSessionActive && !sessionComplete && !awaitingNextRound}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {votes.length ? 'Restart session' : 'Start session'}
            </button>
            {sessionComplete ? (
              <button
                type="button"
                onClick={handleStartNewSession}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Start new round set
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Live status
          </h3>
          <p className="mt-2 text-lg font-medium text-gray-900">{roundProgressLabel}</p>
          {config.theme ? <p className="text-sm text-gray-500">Theme: {config.theme}</p> : null}

          {isSessionActive && !awaitingNextRound ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-gray-700">Current participant</span>
                <span className="text-base font-semibold text-gray-900">{nextParticipantName}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-gray-700">Remaining in this round</span>
                <span className="text-base font-semibold text-gray-900">{remainingVotesInRound}</span>
              </div>
            </div>
          ) : null}

          {awaitingNextRound ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-medium text-gray-800">
                  Round {currentRound + 1} complete!
                </p>
                <p className="text-sm text-gray-500">
                  Review the results below and continue when you are ready.
                </p>
              </div>
              <button
                type="button"
                onClick={handleBeginNextRound}
                className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
              >
                Begin round {currentRound + 2}
              </button>
            </div>
          ) : null}

          {sessionComplete ? (
            <div className="mt-6 rounded-lg bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Trophy className="h-4 w-4 text-amber-500" />
                All rounds completed. Explore the final standings below!
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isSessionActive && !awaitingNextRound ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Cast vote</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a rating for <span className="font-medium text-gray-700">{nextParticipantName}</span> in round{' '}
            <span className="font-medium text-gray-700">{currentRound + 1}</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {schema.values.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSubmitVote(value)}
                className="inline-flex min-w-[3rem] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
              >
                {renderRatingLabel(value)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {votes.length ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Round results</h3>
            <p className="text-sm text-gray-500">
              Completed rounds: <span className="font-medium text-gray-700">{completedRounds}</span> of {config.rounds}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Participant</th>
                  {votes.map((_, roundIndex) => (
                    <th key={roundIndex} className="px-4 py-3 text-center font-semibold text-gray-700">
                      Round {roundIndex + 1}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {config.participantNames.map((name, participantIndex) => {
                  const isWinner = sessionComplete && topPerformerIndex === participantIndex;
                  return (
                    <tr key={name} className={isWinner ? 'bg-amber-50/70' : undefined}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                      {votes.map((roundVotes, roundIndex) => {
                        const value = roundVotes[participantIndex];
                        return (
                          <td key={roundIndex} className="px-4 py-3 text-center text-sm text-gray-700">
                            {value === null ? <span className="text-gray-400">—</span> : value}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {perParticipantAverages[participantIndex] === null
                          ? '—'
                          : perParticipantAverages[participantIndex].toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Round average</th>
                  {roundAverages.map((average, index) => (
                    <td key={index} className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {average === null ? '—' : average.toFixed(2)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    {overallAverage === null ? '—' : overallAverage.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default VotingTool;
