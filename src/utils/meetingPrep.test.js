import { describe, expect, it } from 'vitest';
import {
  buildMeetingSummary,
  deriveFollowUps,
  deriveObjectives,
  deriveQuestions,
  extractTopics,
  normaliseLines,
} from './meetingPrep';

describe('meeting prep utilities', () => {
  it('normalises lines and strips list prefixes', () => {
    const lines = normaliseLines(' - Roadmap\n\n2. Risks\n');
    expect(extractTopics(lines)).toEqual(['Roadmap', 'Risks']);
  });

  it('derives planning outputs from agenda topics', () => {
    const topics = ['Migration', 'Dependencies'];

    expect(deriveObjectives(topics, 'planning')).toEqual([
      'Define success criteria for migration.',
      'Define success criteria for dependencies.',
    ]);
    expect(deriveQuestions(topics, 'planning')).toContain(
      'What milestones do we need to communicate broadly?'
    );
    expect(deriveFollowUps(topics, 'planning')).toContain(
      'Capture owners and deadlines for every deliverable discussed.'
    );
  });

  it('builds a shareable summary block', () => {
    const summary = buildMeetingSummary({
      meetingLabel: 'Status Update',
      objectives: ['Align the team'],
      questions: ['What is blocked?'],
      followUps: ['Send notes'],
    });

    expect(summary).toContain('Meeting type: Status Update');
    expect(summary).toContain('- Align the team');
    expect(summary).toContain('- What is blocked?');
    expect(summary).toContain('- Send notes');
  });
});
