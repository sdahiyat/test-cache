'use client';

import { useState, useEffect } from 'react';
import { Loader2, BookOpen, Zap } from 'lucide-react';
import Link from 'next/link';
import { createStudyLog, updateStudyLog } from '@/lib/study-logs';
import type { StudyLog, StudyLogFormData } from '@/lib/study-logs';

interface StudyLogFormProps {
  onSuccess: (log: StudyLog) => void;
  editLog?: StudyLog | null;
  onCancel?: () => void;
  isLimitReached?: boolean;
  subjects?: string[];
}

export default function StudyLogForm({
  onSuccess,
  editLog,
  onCancel,
  isLimitReached = false,
  subjects = [],
}: StudyLogFormProps) {
  const defaultDatetime = () => new Date().toISOString().slice(0, 16);

  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [loggedAt, setLoggedAt] = useState(defaultDatetime());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editLog) {
      setSubject(editLog.subject);
      setDuration(String(editLog.duration));
      setTasksCompleted(String(editLog.tasks_completed));
      setNotes(editLog.notes ?? '');
      setLoggedAt(new Date(editLog.logged_at).toISOString().slice(0, 16));
    } else {
      setSubject('');
      setDuration('');
      setTasksCompleted('');
      setNotes('');
      setLoggedAt(defaultDatetime());
    }
  }, [editLog]);

  if (isLimitReached && !editLog) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Zap className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-amber-900">
          Free Plan Limit Reached
        </h3>
        <p className="mb-4 text-sm text-amber-700">
          You've used all 500 log entries on the free plan. Upgrade to Pro for unlimited logging.
        </p>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
        >
          <Zap className="h-4 w-4" />
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!subject.trim()) {
      setError('Subject is required.');
      return;
    }
    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 1440) {
      setError('Duration must be between 1 and 1440 minutes.');
      return;
    }
    const tasksNum = parseInt(tasksCompleted, 10);
    if (isNaN(tasksNum) || tasksNum < 0) {
      setError('Tasks completed must be 0 or more.');
      return;
    }
    if (notes.length > 1000) {
      setError('Notes must be 1000 characters or fewer.');
      return;
    }

    const formData: StudyLogFormData = {
      subject: subject.trim(),
      duration: durationNum,
      tasks_completed: tasksNum,
      notes,
      logged_at: new Date(loggedAt).toISOString(),
    };

    setIsSubmitting(true);
    try {
      let log: StudyLog;
      if (editLog) {
        log = await updateStudyLog(editLog.id, formData);
      } else {
        log = await createStudyLog(formData);
      }
      onSuccess(log);
      if (!editLog) {
        // Reset form after create
        setSubject('');
        setDuration('');
        setTasksCompleted('');
        setNotes('');
        setLoggedAt(defaultDatetime());
      }
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      if (e.code === 'limit_reached') {
        setError('You have reached the 500-entry limit on the free plan. Please upgrade.');
      } else {
        setError(e.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 transition';
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
          <BookOpen className="h-4 w-4 text-violet-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          {editLog ? 'Edit Log Entry' : 'Log Study Session'}
        </h2>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Subject */}
      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          list="subject-suggestions"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Mathematics, Physics…"
          className={inputClass}
          required
          maxLength={100}
        />
        {subjects.length > 0 && (
          <datalist id="subject-suggestions">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className={labelClass}>
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          id="duration"
          type="number"
          min={1}
          max={1440}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 60"
          className={inputClass}
          required
        />
      </div>

      {/* Tasks Completed */}
      <div>
        <label htmlFor="tasks_completed" className={labelClass}>
          Tasks Completed <span className="text-red-500">*</span>
        </label>
        <input
          id="tasks_completed"
          type="number"
          min={0}
          value={tasksCompleted}
          onChange={(e) => setTasksCompleted(e.target.value)}
          placeholder="e.g. 5"
          className={inputClass}
          required
        />
      </div>

      {/* Date / Time */}
      <div>
        <label htmlFor="logged_at" className={labelClass}>
          Date &amp; Time
        </label>
        <input
          id="logged_at"
          type="datetime-local"
          value={loggedAt}
          onChange={(e) => setLoggedAt(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes{' '}
          <span className="text-xs font-normal text-gray-400">
            ({notes.length}/1000)
          </span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this session…"
          maxLength={1000}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editLog ? (
            'Save Changes'
          ) : (
            'Log Session'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
