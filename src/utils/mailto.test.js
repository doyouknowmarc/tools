import { describe, expect, it } from 'vitest';
import { generateMailto } from './mailto';

describe('generateMailto', () => {
  it('encodes recipients and query params', () => {
    expect(
      generateMailto({
        to: 'hello@example.com, team@example.com',
        cc: 'copy@example.com',
        bcc: '',
        subject: 'Release prep',
        body: 'Line one\nLine two',
      })
    ).toBe(
      'mailto:hello%40example.com,team%40example.com?cc=copy%40example.com&subject=Release%20prep&body=Line%20one%0D%0ALine%20two'
    );
  });
});
