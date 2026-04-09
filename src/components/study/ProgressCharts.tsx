'use client';

/**
 * NOTE: If you encounter SSR/hydration errors, wrap the default export with:
 *   export default dynamic(() => import('./ProgressCharts'), { ssr: false })
 * in the parent component.
 */

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getDailyHoursData,
  getSubjectBreakdownData,
  getTaskCompletionData,
} from '@/lib/study-logs';
import type { StudyLog } from '@/lib/study-logs';

const CHART_COLORS = [
  '#7c3aed', // violet-600
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#db2777', // pink-600
];

type TimeRange = '7d' | '30d' | '90d';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

interface EmptyStateProps {
  message?: string;
}
function EmptyState({ message = 'No data for this period' }: EmptyStateProps) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-gray-400">
      {message}
    </div>
  );
}

interface ProgressChartsProps {
  logs: StudyLog[];
}

export default function ProgressCharts({ logs }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const days = TIME_RANGE_DAYS[timeRange];

  const dailyHours = useMemo(() => getDailyHoursData(logs, days), [logs, days]);
  const subjectBreakdown = useMemo(() => getSubjectBreakdownData(logs), [logs]);
  const taskCompletion = useMemo(() => getTaskCompletionData(logs, days), [logs, days]);

  const hoursHasData = dailyHours.some((d) => d.hours > 0);
  const tasksHasData = taskCompletion.some((d) => d.tasks > 0);
  const subjectHasData = subjectBreakdown.length > 0;

  // Custom tooltip for subject pie
  const SubjectTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { subject: string; minutes: number; percentage: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const { subject, minutes, percentage } = payload[0].payload;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const timeStr = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
      return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
          <p className="font-semibold text-gray-800">{subject}</p>
          <p className="text-gray-600">
            {timeStr} · {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Time range toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Progress Overview</h2>
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
          {(['7d', '30d', '90d'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                timeRange === r
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {TIME_RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 1 — Hours Studied */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-1">
          <h3 className="text-sm font-semibold text-gray-800">Hours Studied</h3>
          <p className="text-xs text-gray-500">Daily study time over {TIME_RANGE_LABELS[timeRange].toLowerCase()}</p>
        </div>
        {hoursHasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyHours} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={days <= 7 ? 0 : Math.floor(days / 7) - 1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}h`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}h`, 'Hours']}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#hoursGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#7c3aed' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No study hours logged for this period" />
        )}
      </div>

      {/* Chart 2 — Subject Breakdown */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-1">
          <h3 className="text-sm font-semibold text-gray-800">Subject Breakdown</h3>
          <p className="text-xs text-gray-500">Time distribution across subjects (all time)</p>
        </div>
        {subjectHasData ? (
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={subjectBreakdown}
                  dataKey="minutes"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {subjectBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.subject}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<SubjectTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ fontSize: '12px', color: '#374151' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState message="No subject data available yet" />
        )}
      </div>

      {/* Chart 3 — Task Completion */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-1">
          <h3 className="text-sm font-semibold text-gray-800">Task Completion</h3>
          <p className="text-xs text-gray-500">Tasks completed per day over {TIME_RANGE_LABELS[timeRange].toLowerCase()}</p>
        </div>
        {tasksHasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskCompletion} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={days <= 7 ? 0 : Math.floor(days / 7) - 1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value, 'Tasks']}
              />
              <Bar
                dataKey="tasks"
                fill="#059669"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No tasks logged for this period" />
        )}
      </div>
    </div>
  );
}
