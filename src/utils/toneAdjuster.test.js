import { describe, expect, it } from 'vitest';
import {
  analyseText,
  applyTone,
  buildToneRemotePrompt,
  TONES,
} from './toneAdjuster';

describe('tone adjuster utilities', () => {
  it('applies the formal tone transform', () => {
    expect(applyTone("we're ready!", 'formal')).toBe(
      'we are ready. Thank you for your time.'
    );
  });

  it('calculates text metrics', () => {
    expect(analyseText('One short sentence.')).toEqual({
      words: 3,
      sentences: 1,
      readingTime: 1,
    });
  });

  it('builds a remote prompt for non-grammar tones', () => {
    expect(buildToneRemotePrompt(TONES[0], 'hello there')).toContain(
      'Rewrite the message below so it matches a formal tone.'
    );
  });
});
