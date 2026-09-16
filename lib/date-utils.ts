export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(d: Date | string): boolean {
  return isSameDay(d, new Date());
}

export function isTomorrow(d: Date | string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(d, tomorrow);
}

export function isThisWeek(d: Date | string): boolean {
  const target = new Date(d);
  const now = new Date();
  
  // Calculate start of current week (Monday)
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diffToMonday));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
}

export function formatIndianDateTime(isoString?: string | Date | null): {
  dateStr: string;
  timeStr: string;
  relativeLabel?: string;
} {
  if (!isoString) {
    return { dateStr: "Not Scheduled", timeStr: "—" };
  }

  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return { dateStr: "Invalid Date", timeStr: "—" };
  }

  let relativeLabel = "";
  if (isToday(d)) relativeLabel = "Today";
  else if (isTomorrow(d)) relativeLabel = "Tomorrow";

  const dateStr = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeStr = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { dateStr, timeStr, relativeLabel };
}
