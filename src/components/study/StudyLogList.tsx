'use client';

import { useState } from 'react';
import { Pencil, Trash2, CheckSquare, Clock, FileText } from 'lucide-react';
import type { StudyLog } from '@/lib/study-logs';

interface StudyLogListProps {
  logs: StudyLog[];
  onEdit: (log: StudyLog) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

// Hash subject name to one of 8 color classes
const SUBJECT_COLORS = [
  'bg-violet-100 text-violet-800',
  'bg-blue-100 text-blue-800',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
];

function hashSubject(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className="h-5 w-28 rounded-full bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-100" />
      </div>
      <div className="mb-2 flex gap-4">
        <div className="h-4 w-16 rounded bg-gray-100" />
        <div className="h-4 w-16 rounded bg-gray-100" />
      </div>
      <div className="h-3 w-3/4 rounded bg-gray-100" />
    </div>
  );
}

export default function StudyLogList({
  logs,
  onEdit,
  onDelete,
  isLoading,
}: StudyLogListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setConfirmId(id);
  };

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
          <FileText className="h-7 w-7 text-violet-400" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-gray-700">No study logs yet</h3>
        <p className="max-w-xs text-sm text-gray-500">
          Start logging your study sessions to track your progress over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const colorClass = hashSubject(log.subject);
        const isDeleting = deletingId === log.id;
        const isConfirming = confirmId === log.id;

        return (
          <div
            key={log.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
                >
                  {log.subject}
                </span>
                <span className="text-xs text-gray-400">{formatDateTime(log.logged_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                {isConfirming ? (
                  <>
                    <span className="mr-1 text-xs text-gray-600">Delete?</span>
                    <button
                      onClick={() => handleConfirmDelete(log.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(log)}
                      disabled={isDeleting}
                      title="Edit log"
                      className="rounded p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-violet-600 disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(log.id)}
                      disabled={isDeleting}
                      title="Delete log"
                      className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">{formatDuration(log.duration)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  <span className="font-medium">{log.tasks_completed}</span>{' '}
                  {log.tasks_completed === 1 ? 'task' : 'tasks'}
                </span>
              </span>
            </div>

            {/* Notes preview */}
            {log.notes && log.notes.trim().length > 0 && (
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {log.notes.length > 100
                  ? `${log.notes.slice(0, 100)}…`
                  : log.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
