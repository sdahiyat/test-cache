'use client';

interface TaskCompletionChartProps {
  subjects: { subject: string; total_tasks: number }[];
  totalTasks: number;
}

export function TaskCompletionChart({
  subjects,
  totalTasks,
}: TaskCompletionChartProps) {
  const WIDTH = 400;
  const HEIGHT = 200;
  const LABEL_WIDTH = 110;
  const BAR_AREA_WIDTH = WIDTH - LABEL_WIDTH - 50; // 50 for count labels
  const BAR_HEIGHT = 18;
  const BAR_GAP = 10;
  const TOP_PADDING = 20;

  const displaySubjects = subjects.slice(0, 8);
  const maxTasks = Math.max(...displaySubjects.map((s) => s.total_tasks), 1);
  const hasData = displaySubjects.length > 0 && totalTasks > 0;

  const svgHeight = hasData
    ? TOP_PADDING + displaySubjects.length * (BAR_HEIGHT + BAR_GAP) + 10
    : HEIGHT;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Tasks Completed by Subject
      </h3>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${svgHeight}`}
          className="w-full"
          role="img"
          aria-label="Horizontal bar chart showing tasks completed per subject"
        >
          <title>Tasks Completed by Subject</title>

          {!hasData && (
            <text
              x={WIDTH / 2}
              y={HEIGHT / 2}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="14"
              dominantBaseline="middle"
            >
              No data yet
            </text>
          )}

          {hasData &&
            displaySubjects.map((item, i) => {
              const barWidth =
                maxTasks > 0
                  ? (item.total_tasks / maxTasks) * BAR_AREA_WIDTH
                  : 0;
              const y = TOP_PADDING + i * (BAR_HEIGHT + BAR_GAP);
              const truncatedSubject =
                item.subject.length > 14
                  ? item.subject.slice(0, 13) + '…'
                  : item.subject;

              return (
                <g key={item.subject}>
                  {/* Subject label */}
                  <text
                    x={LABEL_WIDTH - 6}
                    y={y + BAR_HEIGHT / 2}
                    textAnchor="end"
                    fill="#374151"
                    fontSize="11"
                    dominantBaseline="middle"
                  >
                    {truncatedSubject}
                  </text>

                  {/* Background bar */}
                  <rect
                    x={LABEL_WIDTH}
                    y={y}
                    width={BAR_AREA_WIDTH}
                    height={BAR_HEIGHT}
                    fill="#f3f4f6"
                    rx={4}
                  />

                  {/* Value bar */}
                  {barWidth > 0 && (
                    <rect
                      x={LABEL_WIDTH}
                      y={y}
                      width={barWidth}
                      height={BAR_HEIGHT}
                      fill="#8b5cf6"
                      rx={4}
                    >
                      <title>{`${item.subject}: ${item.total_tasks} tasks`}</title>
                    </rect>
                  )}

                  {/* Count label */}
                  <text
                    x={LABEL_WIDTH + BAR_AREA_WIDTH + 6}
                    y={y + BAR_HEIGHT / 2}
                    textAnchor="start"
                    fill="#6b7280"
                    fontSize="10"
                    dominantBaseline="middle"
                  >
                    {item.total_tasks}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );
}
