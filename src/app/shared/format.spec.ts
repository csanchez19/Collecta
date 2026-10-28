import { countWidth, formatEuros, formatMonth, formatNumber, formatPct, initials, padCount } from './format';

describe('format', () => {
  it('groups thousands with a dot, even for four digits', () => {
    expect(formatEuros(248_000)).toBe('2.480 €');
    expect(formatEuros(11_500, true)).toBe('115,00 €');
    expect(formatEuros(99)).toBe('1 €');
  });

  it('groups thousands in plain counts', () => {
    expect(formatNumber(23_770)).toBe('23.770');
    expect(formatNumber(220)).toBe('220');
  });

  it('formats a release month without dots', () => {
    expect(formatMonth('2025-07-18')).toMatch(/^jul\w* 2025$/);
  });

  it('pads counts like card numbers', () => {
    expect(padCount(28, countWidth(165))).toBe('028');
    expect(padCount(4, countWidth(1200))).toBe('0004');
  });

  it('drops the sign from percentages', () => {
    expect(formatPct(-3.6)).toBe('4 %');
  });

  it('builds banner initials from the first two words', () => {
    expect(initials('Hot Wheels')).toBe('HW');
    expect(initials('Pokémon TCG')).toBe('PT');
    expect(initials('151')).toBe('1');
  });
});
