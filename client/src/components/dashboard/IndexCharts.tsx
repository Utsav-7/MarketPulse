interface IndexChartsProps {
  labels: string[];
  values: number[];
}

export function IndexCharts({ labels, values }: IndexChartsProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="space-y-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 truncate text-xs text-text-primary">{label}</span>
          <div className="flex-1 h-4 rounded bg-background-primary overflow-hidden">
            <div
              className="h-full rounded bg-accent/70 min-w-[4px]"
              style={{ width: `${(values[i] / max) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-xs text-text-secondary">
            {values[i].toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
