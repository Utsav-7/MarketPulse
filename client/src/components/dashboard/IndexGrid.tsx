interface IndexRow {
  name: string;
  country: string;
  value: number;
  changePercent: number;
}

interface IndexGridProps {
  rows: IndexRow[];
}

export function IndexGrid({ rows }: IndexGridProps) {
  return (
    <div className="divide-y divide-border">
      {rows.map((row) => (
        <div
          key={`${row.country}-${row.name}`}
          className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 truncate">
            <div className="truncate text-xs font-medium text-text-primary">{row.name}</div>
            <div className="text-[10px] text-text-secondary">{row.country}</div>
          </div>
          <div className="flex shrink-0 items-baseline gap-1 text-right">
            <span className="text-xs font-medium text-text-primary">
              {row.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-medium ${
                row.changePercent >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
              }`}
            >
              {row.changePercent >= 0 ? '+' : ''}
              {row.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
