export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}