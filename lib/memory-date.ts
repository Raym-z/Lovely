export const MEMORY_DATE_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MEMORY_DATE_PLACEHOLDER = "September 14, 2026";

const monthLookup = new Map<string, number>();

MEMORY_DATE_MONTHS.forEach((name, index) => {
  monthLookup.set(name.toLowerCase(), index);
  monthLookup.set(name.slice(0, 3).toLowerCase(), index);
});

monthLookup.set("sept", 8);

function buildDate(year: number, monthIndex: number, day: number): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || !Number.isInteger(day)) {
    return null;
  }

  if (year < 1000 || year > 9999 || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, monthIndex, day);

  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function formatMemoryDate(date: Date): string {
  return `${MEMORY_DATE_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function todayMemoryDate(): string {
  return formatMemoryDate(new Date());
}

export function parseMemoryDate(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const monthFirst = trimmed.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i);
  if (monthFirst) {
    const month = monthLookup.get(monthFirst[1].toLowerCase());
    if (month !== undefined) {
      return buildDate(Number(monthFirst[3]), month, Number(monthFirst[2]));
    }
  }

  const dayFirst = trimmed.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?,?\s+(\d{4})$/i);
  if (dayFirst) {
    const month = monthLookup.get(dayFirst[2].toLowerCase());
    if (month !== undefined) {
      return buildDate(Number(dayFirst[3]), month, Number(dayFirst[1]));
    }
  }

  const numeric = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (numeric) {
    return buildDate(Number(numeric[3]), Number(numeric[1]) - 1, Number(numeric[2]));
  }

  return null;
}

export function sanitizeMemoryDateInput(raw: string): string {
  return raw
    .replace(/[^A-Za-z0-9,.\s/-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function normalizeMemoryDateInput(raw: string): string {
  const parsed = parseMemoryDate(raw);
  return parsed ? formatMemoryDate(parsed) : sanitizeMemoryDateInput(raw).trim();
}
