interface PriceRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface PriceGridProps {
  rows: PriceRow[];
  formatPrice?: (price: number) => string;
}

function defaultFormat(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

export function PriceGrid({ rows, formatPrice = defaultFormat }: PriceGridProps) {
  return (
    <div className="divide-y divide-border">
      {rows.map((row) => (
        <div
          key={row.symbol}
          className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 truncate">
            <div className="text-xs font-medium text-text-primary">{row.symbol}</div>
            <div className="truncate text-[10px] text-text-secondary">{row.name}</div>
          </div>
          <div className="flex shrink-0 items-baseline gap-1 text-right">
            <span className="text-xs font-medium text-text-primary">
              {formatPrice(row.price)}
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
