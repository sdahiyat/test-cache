'use client';

import { useState } from 'react';
import type { StudyLog } from '@/types/study-log';
import { deleteStudyLogAction } from '../actions';

interface StudyLogCardProps {
  log: StudyLog;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function StudyLogCard({ log, onEdit, onDelete }: StudyLogCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteStudyLogAction(log.id);
      if (result.error) {
        console.error('Delete error:', result.error);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }
      onDelete();
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {log.subject}
            </h3>
            <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDuration(log.duration_minutes)}
            </span>

            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-violet-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {log.tasks_completed} {log.tasks_completed === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {log.notes && (
            <p className="text-sm text-gray-500 line-clamp-2">{log.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={onEdit}
                disabled={isDeleting}
                aria-label={`Edit log entry for ${log.subject}`}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                aria-label={`Delete log entry for ${log.subject}`}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div
              role="alert"
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5"
            >
              <span className="text-xs text-red-700 font-medium">
                Delete?
              </span>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                aria-label="Confirm delete"
                className="text-xs font-semibold text-red-600 hover:text-red-800 focus:outline-none focus:underline disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                aria-label="Cancel delete"
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 focus:outline-none focus:underline disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
