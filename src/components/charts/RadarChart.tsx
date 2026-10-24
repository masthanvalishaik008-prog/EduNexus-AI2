interface RadarMetric {
  label: string;
  value: number; // 0 - 100
  benchmark?: number; // 0 - 100
}

interface RadarChartProps {
  data: RadarMetric[];
  size?: number;
  className?: string;
}

export function RadarChart({ data, size = 320, className = '' }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 48;
  const total = data.length;
  if (total < 3) return null;

  // Grid levels (20, 40, 60, 80, 100)
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / total) * index - (Math.PI / 2);
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Student polygon points
  const points = data.map((d, i) => {
    const { x, y } = getCoordinates(d.value, i);
    return `${x},${y}`;
  }).join(' ');

  // Optional benchmark points (e.g. 75 threshold)
  const hasBenchmark = data.some(d => d.benchmark !== undefined);
  const benchmarkPoints = hasBenchmark
    ? data.map((d, i) => {
        const { x, y } = getCoordinates(d.benchmark || 75, i);
        return `${x},${y}`;
      }).join(' ')
    : '';

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Rings */}
        {levels.map((lvl) => {
          const r = (lvl / 100) * radius;
          return (
            <circle
              key={lvl}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#e2e8f0"
              strokeDasharray={lvl === 100 ? 'none' : '3,3'}
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark polygon (Cohort Average) */}
        {hasBenchmark && (
          <polygon
            points={benchmarkPoints}
            fill="#94a3b8"
            fillOpacity="0.12"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
        )}

        {/* Student Value Polygon */}
        <polygon
          points={points}
          fill="#3b82f6"
          fillOpacity="0.25"
          stroke="#2563eb"
          strokeWidth="2.5"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(d.value, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="fill-blue-600 stroke-white stroke-2"
            />
          );
        })}

        {/* Metric Labels */}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 / total) * i - (Math.PI / 2);
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          const isRight = Math.cos(angle) > 0.1;
          const isLeft = Math.cos(angle) < -0.1;
          const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

          return (
            <g key={i}>
              <text
                x={lx}
                y={ly - 2}
                textAnchor={textAnchor}
                className="text-[11px] font-semibold fill-slate-700"
              >
                {d.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor={textAnchor}
                className="text-[10px] font-mono tabular-nums fill-blue-600 font-medium"
              >
                {d.value}%
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-6 mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-600"></span>
          <span>Student Score</span>
        </div>
        {hasBenchmark && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400"></span>
            <span>Department Benchmark (75%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
