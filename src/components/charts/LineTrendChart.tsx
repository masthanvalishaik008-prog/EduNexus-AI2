interface TrendPoint {
  label: string;
  value: number;
}

interface LineTrendChartProps {
  data: TrendPoint[];
  threshold?: number;
  thresholdLabel?: string;
  height?: number;
  className?: string;
  color?: string;
}

export function LineTrendChart({
  data,
  threshold = 75,
  thresholdLabel = 'Min Mandatory Threshold (75%)',
  height = 180,
  className = '',
  color = '#2563eb',
}: LineTrendChartProps) {
  if (!data || data.length === 0) return null;

  const width = 480;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const minY = 40;
  const maxY = 100;

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const range = maxY - minY;
    const chartHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - ((clamped - minY) / range) * chartHeight;
  };

  const getX = (index: number) => {
    const total = data.length;
    if (total <= 1) return width / 2;
    const chartWidth = width - (paddingX * 2);
    return paddingX + (index / (total - 1)) * chartWidth;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const thresholdY = getY(threshold);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Background Grid Lines */}
        {[50, 75, 100].map((gridVal) => (
          <g key={gridVal}>
            <line
              x1={paddingX}
              y1={getY(gridVal)}
              x2={width - paddingX}
              y2={getY(gridVal)}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={gridVal === threshold ? '4,4' : 'none'}
            />
            <text
              x={paddingX - 8}
              y={getY(gridVal) + 4}
              textAnchor="end"
              className="text-[10px] font-mono fill-slate-400"
            >
              {gridVal}%
            </text>
          </g>
        ))}

        {/* Threshold indicator line if specified */}
        {threshold && (
          <line
            x1={paddingX}
            y1={thresholdY}
            x2={width - paddingX}
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
        )}

        {/* Gradient fill under line */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <polygon
          points={`${paddingX},${height - paddingBottom} ${points} ${width - paddingX},${height - paddingBottom}`}
          fill="url(#trendGradient)"
        />

        {/* Main Trend Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots & Labels */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isBelow = d.value < threshold;

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="4.5"
                className={`${isBelow ? 'fill-red-500 stroke-white' : 'fill-blue-600 stroke-white'} stroke-2`}
              />
              <text
                x={cx}
                y={cy - 9}
                textAnchor="middle"
                className={`text-[11px] font-mono tabular-nums font-semibold ${isBelow ? 'fill-red-600' : 'fill-slate-700'}`}
              >
                {d.value}%
              </text>
              <text
                x={cx}
                y={height - 10}
                textAnchor="middle"
                className="text-[11px] fill-slate-500 font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {thresholdLabel && (
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="w-3 h-0.5 border-t border-dashed border-red-500"></span>
          <span>{thresholdLabel}</span>
        </div>
      )}
    </div>
  );
}
