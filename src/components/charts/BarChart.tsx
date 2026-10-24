interface BarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
  color?: string;
}

interface BarChartProps {
  data: BarItem[];
  maxValue?: number;
  height?: number;
  unit?: string;
  className?: string;
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  unit = '%',
  className = '',
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between gap-3 h-[200px] pt-4 px-2 pb-6 border-b border-slate-200">
        {data.map((item, idx) => {
          const heightPercent = Math.min(100, (item.value / max) * 100);
          const barColor = item.color || (item.highlight ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400');

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="text-[11px] font-mono tabular-nums text-slate-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                {item.value}{unit}
              </div>
              <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md relative flex items-end justify-center h-full overflow-hidden">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full transition-all duration-300 rounded-t-md ${barColor}`}
                />
              </div>
              <span className="mt-2 text-xs font-medium text-slate-600 text-center truncate max-w-[80px]" title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
