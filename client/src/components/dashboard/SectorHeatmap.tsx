interface SectorRow {
  sector: string;
  change: number;
}

interface SectorHeatmapProps {
  rows: SectorRow[];
}

export function SectorHeatmap({ rows }: SectorHeatmapProps) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.change)), 1);
  return (
    <div className="space-y-1">
      {rows.map((row) => {
        const pct = (Math.abs(row.change) / maxAbs) * 100;
        const isPos = row.change >= 0;
        return (
          <div key={row.sector} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-text-primary">{row.sector}</span>
            <div className="flex-1 rounded bg-background-primary h-5 overflow-hidden">
              <div
                className={`h-full rounded ${isPos ? 'bg-[var(--positive)]' : 'bg-[var(--negative)]'}`}
                style={{ width: `${pct}%`, marginLeft: isPos ? 0 : 'auto' }}
              />
            </div>
            <span
              className={`w-10 shrink-0 text-right text-xs font-medium ${
                isPos ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
              }`}
            >
              {row.change >= 0 ? '+' : ''}
              {row.change.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
