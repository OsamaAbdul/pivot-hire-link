type SessionLogEvent = {
  type: string;
  timestamp: number;
  userId?: string | null;
  details?: Record<string, any>;
};

const KEY = "session_logs_v1";

function readLogs(): SessionLogEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: SessionLogEvent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(logs.slice(-500)));
  } catch {
    // ignore storage errors
  }
}

export function logEvent(type: string, userId?: string | null, details?: Record<string, any>) {
  const entry: SessionLogEvent = { type, timestamp: Date.now(), userId: userId ?? null, details };
  const logs = readLogs();
  logs.push(entry);
  writeLogs(logs);
  if (type.startsWith("error")) {
    console.error("[Session]", type, entry);
  } else {
    console.debug("[Session]", type, entry);
  }
}

export function getStats() {
  const logs = readLogs();
  const stats = logs.reduce(
    (acc, l) => {
      acc.counts[l.type] = (acc.counts[l.type] || 0) + 1;
      return acc;
    },
    { counts: {} as Record<string, number>, total: logs.length }
  );
  return { ...stats, last: logs[logs.length - 1] };
}

export function clearLogs() {
  localStorage.removeItem(KEY);
}