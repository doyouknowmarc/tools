import { describe, expect, it } from 'vitest';
import { contrastText, kelvinToHex, normalizeHex } from './screenColor';

describe('screenColor utils', () => {
  it('normalizes short and long hex values', () => {
    expect(normalizeHex('#FFF')).toBe('#ffffff');
    expect(normalizeHex('00b140')).toBe('#00b140');
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex('green')).toBeNull();
  });

  it('turns warm temperatures orange and cool ones blue-ish', () => {
    expect(kelvinToHex(6600)).toBe('#ffffff');
    expect(kelvinToHex(2000)).toMatch(/^#ff[0-9a-f]{2}[0-9a-f]{2}$/);
    const cool = kelvinToHex(9000);
    expect(parseInt(cool.slice(5, 7), 16)).toBe(255);
    expect(parseInt(cool.slice(1, 3), 16)).toBeLessThan(255);
  });

  it('picks a readable label color', () => {
    expect(contrastText('#ffffff')).toBe('#000000');
    expect(contrastText('#000000')).toBe('#ffffff');
  });
});
