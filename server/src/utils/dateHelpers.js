export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(dateA, dateB) {
  const ms = Math.abs(new Date(dateA) - new Date(dateB));
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
