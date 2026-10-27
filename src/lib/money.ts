/** Parses user input like "2,30", "-10", "100 €" into cents. Returns null if invalid. */
export function parseAmount(input: string): number | null {
  const s = input.replace(/[\s€]/g, '');
  const m = /^([+-]?)(\d+)(?:[.,](\d{1,2}))?$/.exec(s);
  if (!m) return null;
  const cents = Number(m[2]) * 100 + Number((m[3] ?? '').padEnd(2, '0'));
  return m[1] === '-' ? -cents : cents;
}

/** Formats cents like the designs: "1128.00 €", "-10.00 €". */
export function formatAmount(cents: number, plusSign = false): string {
  const sign = cents < 0 ? '-' : plusSign && cents > 0 ? '+' : '';
  return `${sign}${(Math.abs(cents) / 100).toFixed(2)} €`;
}

/** Cents → editable input text, e.g. 230 → "2.30". */
export function amountInput(cents: number): string {
  return (cents / 100).toFixed(2);
}
