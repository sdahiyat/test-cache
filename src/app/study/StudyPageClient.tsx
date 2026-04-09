'use client';

import { useState, useMemo } from 'react';
import type { StudyLog, ProgressStats } from '@/types/study-log';
import { CreateLogForm } from './components/CreateLogForm';
import { StudyLogList } from './components/StudyLogList';
import { ProgressCharts } from './components/ProgressCharts';
import { FreeTierBanner } from './components/FreeTierBanner';

interface StudyPageClientProps {
  initialLogs: StudyLog[];
  initialCount: number;
  progressStats: ProgressStats;
  subscriptionTier: string;
}

export function StudyPageClient({
  initialLogs,
  initialCount,
  subscriptionTier,
}: StudyPageClientProps) {
  const [logs, setLogs] = useState<StudyLog[]>(initialLogs);
  const [count, setCount] = useState<number>(initialCount);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FREE_TIER_LIMIT = 500;

  function handleCreateSuccess(log: StudyLog) {
    setLogs((prev) => [log, ...prev]);
    setCount((prev) => prev + 1);
    setShowCreateForm(false);
  }

  function handleUpdateSuccess(updated: StudyLog) {
    setLogs((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setCount((prev) => Math.max(0, prev - 1));
  }

  // Recompute stats from local logs state
  const liveStats = useMemo<ProgressStats>(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Daily hours (last 30 days)
    const dailyMap: Record<string, number> = {};
    for (const log of logs) {
      const logDate = new Date(log.created_at);
      if (logDate >= thirtyDaysAgo) {
        const dateStr = logDate.toLocaleDateString('en-CA');
        dailyMap[dateStr] = (dailyMap[dateStr] ?? 0) + log.duration_minutes;
      }
    }

    const dailyHours: { date: string; hours: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      dailyHours.push({
        date: dateStr,
        hours: Math.round(((dailyMap[dateStr] ?? 0) / 60) * 100) / 100,
      });
    }

    // Subject breakdown
    const subjectMinuteMap: Record<string, number> = {};
    for (const log of logs) {
      subjectMinuteMap[log.subject] =
        (subjectMinuteMap[log.subject] ?? 0) + log.duration_minutes;
    }
    const totalMinutes = Object.values(subjectMinuteMap).reduce(
      (a, b) => a + b,
      0
    );
    const subjectBreakdown = Object.entries(subjectMinuteMap)
      .map(([subject, minutes]) => ({
        subject,
        minutes,
        percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 10);

    // Task completion rate
    const taskMap: Record<string, number> = {};
    for (const log of logs) {
      taskMap[log.subject] =
        (taskMap[log.subject] ?? 0) + log.tasks_completed;
    }
    const taskCompletionRate = Object.entries(taskMap)
      .map(([subject, total_tasks]) => ({ subject, total_tasks }))
      .sort((a, b) => b.total_tasks - a.total_tasks);

    const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0);

    return {
      dailyHours,
      subjectBreakdown,
      taskCompletionRate,
      totalMinutes,
      totalTasks,
      totalEntries: logs.length,
    };
  }, [logs]);

  const atLimit = count >= FREE_TIER_LIMIT && subscriptionTier === 'free';
  const approachingLimit =
    count >= FREE_TIER_LIMIT - 50 && subscriptionTier === 'free';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Log</h1>
        {!showCreateForm && (
          <button
            onClick={() => {
              if (atLimit) return;
              setShowCreateForm(true);
            }}
            disabled={atLimit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Create new study log entry"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Entry
          </button>
        )}
      </div>

      {/* Free tier banner */}
      {approachingLimit && (
        <FreeTierBanner count={count} limit={FREE_TIER_LIMIT} />
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-6">
          <CreateLogForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      )}

      {/* Progress charts */}
      <div className="mb-8">
        <ProgressCharts progressStats={liveStats} />
      </div>

      {/* Log list */}
      <StudyLogList
        logs={logs}
        editingId={editingId}
        onEdit={setEditingId}
        onDelete={handleDelete}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}
