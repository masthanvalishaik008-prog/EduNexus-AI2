interface ScoreGaugeProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  showSubtitle?: boolean;
}

export function ScoreGauge({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Success Score',
  showSubtitle = true,
}: ScoreGaugeProps) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 65) return '#2563eb'; // blue
    if (s >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getStatusText = (s: number) => {
    if (s >= 80) return 'High Potential';
    if (s >= 65) return 'On Track';
    if (s >= 50) return 'Needs Attention';
    return 'Critical Support';
  };

  const strokeColor = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      {showSubtitle && (
        <div className="mt-2 text-center">
          <div className="text-xs font-semibold text-slate-700">{label}</div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">{getStatusText(score)}</div>
        </div>
      )}
    </div>
  );
}
