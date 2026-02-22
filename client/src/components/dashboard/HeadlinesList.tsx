import type { NewsItem } from '../../data/dashboardDummyData';

interface HeadlinesListProps {
  items: NewsItem[];
}

export function HeadlinesList({ items }: HeadlinesListProps) {
  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => (
        <div key={i} className="py-1.5 first:pt-0">
          <div className="flex items-start justify-between gap-1">
            <p className="min-w-0 flex-1 text-xs text-text-primary line-clamp-2">{item.headline}</p>
            <span className="shrink-0 text-[10px] text-text-secondary">{item.timeAgo}</span>
          </div>
          <span className="mt-0.5 inline-block text-[10px] font-medium text-accent">{item.source}</span>
        </div>
      ))}
    </div>
  );
}
