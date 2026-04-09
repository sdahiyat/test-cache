'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import StudyLogForm from '@/components/study/StudyLogForm';
import StudyLogList from '@/components/study/StudyLogList';
import ProgressCharts from '@/components/study/ProgressCharts';
import { deleteStudyLog } from '@/lib/study-logs';
import type { StudyLog } from '@/lib/study-logs';

interface StudyPageClientProps {
  initialLogs: StudyLog[];
  userId: string;
  isLimitReached: boolean;
}

export default function StudyPageClient({
  initialLogs,
  userId: _userId,
  isLimitReached,
}: StudyPageClientProps) {
  const [logs, setLogs] = useState<StudyLog[]>(initialLogs);
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const subjects = useMemo(
    () => Array.from(new Set(logs.map((l) => l.subject))).sort(),
    [logs]
  );

  const handleLogCreated = useCallback((log: StudyLog) => {
    setLogs((prev) => [log, ...prev]);
    setShowMobileForm(false);
  }, []);

  const handleLogUpdated = useCallback((log: StudyLog) => {
    setLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)));
    setEditingLog(null);
  }, []);

  const handleDeleteLog = useCallback(async (id: string) => {
    await deleteStudyLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleEdit = useCallback((log: StudyLog) => {
    setEditingLog(log);
    setShowMobileForm(true);
    // Scroll to form on mobile
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingLog(null);
    setShowMobileForm(false);
  }, []);

  const handleFormSuccess = useCallback(
    (log: StudyLog) => {
      if (editingLog) {
        handleLogUpdated(log);
      } else {
        handleLogCreated(log);
      }
    },
    [editingLog, handleLogCreated, handleLogUpdated]
  );

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: charts + log list */}
        <div className="space-y-6 lg:col-span-2">
          <ProgressCharts logs={logs} />
          <div>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Log History
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
              </span>
            </h2>
            <StudyLogList
              logs={logs}
              onEdit={handleEdit}
              onDelete={handleDeleteLog}
              isLoading={false}
            />
          </div>
        </div>

        {/* Right column: form (desktop always visible, mobile toggleable) */}
        <div
          ref={formRef}
          className={`lg:col-span-1 ${
            showMobileForm ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <StudyLogForm
                onSuccess={handleFormSuccess}
                editLog={editingLog}
                onCancel={editingLog ? handleCancelEdit : undefined}
                isLimitReached={isLimitReached}
                subjects={subjects}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => {
          if (showMobileForm) {
            setShowMobileForm(false);
            setEditingLog(null);
          } else {
            setShowMobileForm(true);
          }
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 shadow-lg transition hover:bg-violet-700 active:scale-95 lg:hidden"
        aria-label={showMobileForm ? 'Close form' : 'Log new session'}
      >
        {showMobileForm ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
