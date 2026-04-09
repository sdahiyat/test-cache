'use client';

import type { StudyLog } from '@/types/study-log';
import { StudyLogCard } from './StudyLogCard';
import { EditLogForm } from './EditLogForm';

interface StudyLogListProps {
  logs: StudyLog[];
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (log: StudyLog) => void;
}

export function StudyLogList({
  logs,
  editingId,
  onEdit,
  onDelete,
  onUpdate,
}: StudyLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No study logs yet
        </h3>
        <p className="text-sm text-gray-500">
          Create your first entry to start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Log Entries
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({logs.length})
        </span>
      </h2>
      <div className="space-y-3">
        {logs.map((log) =>
          log.id === editingId ? (
            <EditLogForm
              key={log.id}
              log={log}
              onSuccess={onUpdate}
              onCancel={() => onEdit(null)}
            />
          ) : (
            <StudyLogCard
              key={log.id}
              log={log}
              onEdit={() => onEdit(log.id)}
              onDelete={() => onDelete(log.id)}
            />
          )
        )}
      </div>
    </div>
  );
}
