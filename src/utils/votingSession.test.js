import { describe, expect, it } from 'vitest';
import {
  applyVoteSelection,
  createStartedVotingSession,
  getRoundProgressLabel,
  getVotingProgressAfterVote,
  normalizeVotingConfig,
} from './votingSession';

describe('voting session utilities', () => {
  it('normalizes participant names and creates session state', () => {
    const config = normalizeVotingConfig({
      participantCount: 2,
      participantNames: ['Alice', ''],
      rounds: 2,
      schema: '1-10',
      theme: 'Demo',
    });
    const session = createStartedVotingSession(config);

    expect(config.participantNames).toEqual(['Alice', 'Participant 2']);
    expect(session.votes).toEqual([
      [null, null],
      [null, null],
    ]);
  });

  it('applies votes and advances session progress', () => {
    const votes = [
      [null, null],
      [null, null],
    ];

    expect(applyVoteSelection(votes, 0, 1, 7)).toEqual([
      [null, 7],
      [null, null],
    ]);

    expect(
      getVotingProgressAfterVote({
        currentParticipant: 1,
        currentRound: 0,
        participantCount: 2,
        rounds: 2,
      })
    ).toEqual({
      awaitingNextRound: true,
      currentParticipant: 0,
      isSessionActive: false,
      sessionComplete: false,
    });
  });

  it('builds the right round progress label', () => {
    expect(
      getRoundProgressLabel({
        awaitingNextRound: false,
        currentRound: 1,
        hasVotes: true,
        isSessionActive: true,
        rounds: 3,
        sessionComplete: false,
      })
    ).toBe('Round 2 of 3');
  });
});
