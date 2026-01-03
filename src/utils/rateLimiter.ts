// Returns true if deletes are under the limit within the window
export function canDeleteWithTimestamps(timestamps: number[], now: number = Date.now(), limit: number = 5, windowMs: number = 60_000): boolean {
  const recent = timestamps.filter((t) => now - t < windowMs);
  return recent.length < limit;
}