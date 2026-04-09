'use client';

import type { ProgressStats } from '@/types/study-log';
import { HoursChart } from './HoursChart';
import { SubjectDonutChart } from './SubjectDonutChart';
import { TaskCompletionChart } from './TaskCompletionChart';

interface ProgressChartsProps {
  progressStats: ProgressStats;
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ProgressCharts({ progressStats }: ProgressChartsProps) {
  const { dailyHours, subjectBreakdown, taskCompletionRate, totalMinutes, totalTasks, totalEntries } =
    progressStats;

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">
            {formatHours(totalMinutes)}
          </p>
          <p className="text-xs text-indigo-500 mt-0.5 font-medium">
            Total Time
          </p>
        </div>
        <div className="bg-violet-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-violet-700">{totalTasks}</p>
          <p className="text-xs text-violet-500 mt-0.5 font-medium">
            Total Tasks
          </p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-pink-700">{totalEntries}</p>
          <p className="text-xs text-pink-500 mt-0.5 font-medium">
            Log Entries
          </p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <HoursChart dailyHours={dailyHours} />
        </div>
        <div className="lg:col-span-1">
          <SubjectDonutChart breakdown={subjectBreakdown} />
        </div>
        <div className="lg:col-span-1">
          <TaskCompletionChart
            subjects={taskCompletionRate}
            totalTasks={totalTasks}
          />
        </div>
      </div>
    </div>
  );
}
