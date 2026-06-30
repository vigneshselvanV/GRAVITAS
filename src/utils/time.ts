export function getHoursSince(dateString: string | null): number {
  if (!dateString) return 0;
  const past = new Date(dateString).getTime();
  const now = Date.now();
  return (now - past) / (1000 * 60 * 60);
}

export function formatISODate(dateString: string | null): string {
  if (!dateString) return "No deadline";
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function getHoursUntil(dateString: string | null): number {
  if (!dateString) return Infinity;
  const future = new Date(dateString).getTime();
  const now = Date.now();
  return (future - now) / (1000 * 60 * 60);
}

export function formatTimeRemaining(dateString: string | null): string {
  if (!dateString) return "∞";
  const hours = getHoursUntil(dateString);
  if (hours <= 0) return "OVERDUE";
  if (hours < 1) return `${Math.floor(hours * 60)} mins`;
  if (hours < 24) return `${Math.floor(hours)} hrs`;
  return `${Math.floor(hours / 24)} days`;
}
