'use client';

interface HoursChartProps {
  dailyHours: { date: string; hours: number }[];
}

export function HoursChart({ dailyHours }: HoursChartProps) {
  const WIDTH = 600;
  const HEIGHT = 200;
  const PADDING = { top: 20, right: 10, bottom: 50, left: 40 };
  const CHART_WIDTH = WIDTH - PADDING.left - PADDING.right;
  const CHART_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

  const maxHours = Math.max(...dailyHours.map((d) => d.hours), 0.1);
  const barCount = dailyHours.length;
  const barWidth = CHART_WIDTH / barCount;
  const barGap = 2;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) =>
    Math.round(maxHours * t * 10) / 10
  );

  const hasData = dailyHours.some((d) => d.hours > 0);

  // Show date labels every 7 days
  const labelIndices = new Set<number>();
  for (let i = 0; i < barCount; i += 7) {
    labelIndices.add(i);
  }
  labelIndices.add(barCount - 1);

  function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Hours Studied (Last 30 Days)
      </h3>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Bar chart showing hours studied per day over the last 30 days"
        >
          <title>Hours Studied (Last 30 Days)</title>

          {!hasData && (
            <text
              x={WIDTH / 2}
              y={HEIGHT / 2}
              textAnchor="middle"
              className="text-gray-400"
              fill="#9ca3af"
              fontSize="14"
            >
              No data yet
            </text>
          )}

          {hasData && (
            <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
              {/* Y gridlines and labels */}
              {yTicks.map((tick, i) => {
                const y = CHART_HEIGHT - (tick / maxHours) * CHART_HEIGHT;
                return (
                  <g key={i}>
                    <line
                      x1={0}
                      y1={y}
                      x2={CHART_WIDTH}
                      y2={y}
                      stroke="#f3f4f6"
                      strokeWidth={1}
                    />
                    <text
                      x={-6}
                      y={y + 4}
                      textAnchor="end"
                      fill="#9ca3af"
                      fontSize="10"
                    >
                      {tick}h
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {dailyHours.map((d, i) => {
                const barH =
                  d.hours > 0
                    ? Math.max((d.hours / maxHours) * CHART_HEIGHT, 2)
                    : 0;
                const x = i * barWidth + barGap / 2;
                const y = CHART_HEIGHT - barH;
                const w = barWidth - barGap;

                return (
                  <g key={d.date}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={barH}
                      fill="#6366f1"
                      rx={2}
                      opacity={d.hours > 0 ? 1 : 0}
                    >
                      <title>{`${formatShortDate(d.date)}: ${d.hours}h`}</title>
                    </rect>

                    {/* X-axis date labels */}
                    {labelIndices.has(i) && (
                      <text
                        x={x + w / 2}
                        y={CHART_HEIGHT + 14}
                        textAnchor="end"
                        fill="#9ca3af"
                        fontSize="9"
                        transform={`rotate(-45, ${x + w / 2}, ${
                          CHART_HEIGHT + 14
                        })`}
                      >
                        {formatShortDate(d.date)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* X-axis baseline */}
              <line
                x1={0}
                y1={CHART_HEIGHT}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
