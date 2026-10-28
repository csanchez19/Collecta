/** Presentation formatting shared by every page's view-model mapping (Spanish conventions). */

/** 248000 → "2.480 €"; with decimals → "2.480,00 €". Groups thousands even for 4 digits. */
export function formatEuros(cents: number, withDecimals = false): string {
  const fixed = withDecimals ? (cents / 100).toFixed(2) : Math.round(cents / 100).toString();
  const [whole, decimals] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimals ? `${grouped},${decimals} €` : `${grouped} €`;
}

/** 28 with width 3 → "028": the card-number look used for every count. */
export function padCount(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

/** Width that fits `total`, at least 3 — so "028/165" and "004/012" read alike. */
export function countWidth(total: number): number {
  return Math.max(3, String(total).length);
}

/** 12.4 → "12 %", -3 → "3 %" (the arrow carries the sign). */
export function formatPct(value: number): string {
  return `${Math.abs(Math.round(value))} %`;
}

/** "2023-09-22" → "22 sept 2023". */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${isoDate}T00:00:00`))
    .replace('.', '');
}

/** "Hot Wheels" → "HW": big faint letters behind banners. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[\p{L}\d]/u.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
