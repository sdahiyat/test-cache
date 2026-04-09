export type StudyLog = {
  id: string;
  user_id: string;
  subject: string;
  duration: number;
  tasks_completed: number;
  notes: string;
  logged_at: string;
  created_at: string;
  updated_at: string;
};

export type StudyLogFormData = {
  subject: string;
  duration: number | '';
  tasks_completed: number | '';
  notes: string;
  logged_at: string;
};

// ── API helpers ──────────────────────────────────────────────────────────────

export async function fetchStudyLogs(): Promise<StudyLog[]> {
  const res = await fetch('/api/study-logs', { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to fetch study logs');
  }
  return res.json();
}

export async function createStudyLog(data: StudyLogFormData): Promise<StudyLog> {
  const res = await fetch('/api/study-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: Error & { code?: string } = new Error(
      body.message ?? 'Failed to create study log'
    );
    err.code = body.error;
    throw err;
  }
  return res.json();
}

export async function updateStudyLog(
  id: string,
  data: Partial<StudyLogFormData>
): Promise<StudyLog> {
  const res = await fetch(`/api/study-logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to update study log');
  }
  return res.json();
}

export async function deleteStudyLog(id: string): Promise<void> {
  const res = await fetch(`/api/study-logs/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to delete study log');
  }
}

// ── Chart data helpers ────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDailyHoursData(
  logs: StudyLog[],
  days: number
): { date: string; hours: number }[] {
  const today = startOfDay(new Date());
  const buckets: Map<string, number> = new Map();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(formatDate(d), 0);
  }

  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  for (const log of logs) {
    const logDate = startOfDay(new Date(log.logged_at));
    if (logDate < cutoff) continue;
    const key = formatDate(logDate);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + log.duration);
    }
  }

  return Array.from(buckets.entries()).map(([date, minutes]) => ({
    date,
    hours: Math.round((minutes / 60) * 100) / 100,
  }));
}

export function getSubjectBreakdownData(
  logs: StudyLog[]
): { subject: string; minutes: number; percentage: number }[] {
  const totals: Map<string, number> = new Map();

  for (const log of logs) {
    totals.set(log.subject, (totals.get(log.subject) ?? 0) + log.duration);
  }

  const grandTotal = Array.from(totals.values()).reduce((a, b) => a + b, 0);
  if (grandTotal === 0) return [];

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([subject, minutes]) => ({
      subject,
      minutes,
      percentage: Math.round((minutes / grandTotal) * 1000) / 10,
    }));
}

export function getTaskCompletionData(
  logs: StudyLog[],
  days: number
): { date: string; tasks: number }[] {
  const today = startOfDay(new Date());
  const buckets: Map<string, number> = new Map();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(formatDate(d), 0);
  }

  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  for (const log of logs) {
    const logDate = startOfDay(new Date(log.logged_at));
    if (logDate < cutoff) continue;
    const key = formatDate(logDate);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + log.tasks_completed);
    }
  }

  return Array.from(buckets.entries()).map(([date, tasks]) => ({ date, tasks }));
}
