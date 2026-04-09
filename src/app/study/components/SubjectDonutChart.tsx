'use client';

interface SubjectDonutChartProps {
  breakdown: { subject: string; minutes: number; percentage: number }[];
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#0ea5e9',
  '#64748b',
];

interface ArcSegment {
  path: string;
  color: string;
  subject: string;
  percentage: number;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angleRad - Math.PI / 2),
    y: cy + r * Math.sin(angleRad - Math.PI / 2),
  };
}

function buildArcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

export function SubjectDonutChart({ breakdown }: SubjectDonutChartProps) {
  const CX = 150;
  const CY = 130;
  const OUTER_R = 100;
  const INNER_R = 60;

  const hasData = breakdown.length > 0 && breakdown.some((b) => b.minutes > 0);

  const segments: ArcSegment[] = [];
  if (hasData) {
    let currentAngle = 0;
    for (let i = 0; i < breakdown.length; i++) {
      const item = breakdown[i];
      const angleSpan = (item.percentage / 100) * 2 * Math.PI;
      if (angleSpan === 0) continue;
      const endAngle = currentAngle + angleSpan;
      segments.push({
        path: buildArcPath(CX, CY, OUTER_R, INNER_R, currentAngle, endAngle),
        color: COLORS[i % COLORS.length],
        subject: item.subject,
        percentage: item.percentage,
      });
      currentAngle = endAngle;
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Study Time by Subject
      </h3>
      <svg
        viewBox="0 0 300 300"
        className="w-full max-w-xs mx-auto"
        role="img"
        aria-label="Donut chart showing study time breakdown by subject"
      >
        <title>Study Time by Subject</title>

        {!hasData && (
          <text
            x={150}
            y={150}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="14"
            dominantBaseline="middle"
          >
            No data yet
          </text>
        )}

        {hasData && (
          <>
            {segments.map((seg, i) => (
              <path key={i} d={seg.path} fill={seg.color}>
                <title>
                  {seg.subject}: {Math.round(seg.percentage)}%
                </title>
              </path>
            ))}

            {/* Center label */}
            <text
              x={CX}
              y={CY - 8}
              textAnchor="middle"
              fill="#374151"
              fontSize="12"
              fontWeight="600"
              dominantBaseline="middle"
            >
              {breakdown.length}
            </text>
            <text
              x={CX}
              y={CY + 10}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="10"
              dominantBaseline="middle"
            >
              subjects
            </text>

            {/* Legend */}
            {breakdown.slice(0, 6).map((item, i) => (
              <g key={i} transform={`translate(10, ${250 + i * 0})`}>
                {/* We'll do legend below the SVG in HTML for better rendering */}
              </g>
            ))}
          </>
        )}
      </svg>

      {/* HTML legend for better text rendering */}
      {hasData && (
        <div className="mt-2 space-y-1.5">
          {breakdown.slice(0, 8).map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="text-xs text-gray-600 truncate">
                  {item.subject}
                </span>
              </div>
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">
                {Math.round(item.percentage)}%
              </span>
            </div>
          ))}
          {breakdown.length > 8 && (
            <p className="text-xs text-gray-400">
              +{breakdown.length - 8} more subjects
            </p>
          )}
        </div>
      )}
    </div>
  );
}
