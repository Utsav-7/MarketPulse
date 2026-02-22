interface NewsItem {
  source: string;
  headline: string;
  timeAgo: string;
}

interface NewsGridProps {
  items: NewsItem[];
  channels?: string[];
  activeChannel?: string;
  onChannelChange?: (channel: string) => void;
}

export function NewsGrid({
  items,
  channels,
  activeChannel,
  onChannelChange,
}: NewsGridProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {channels && channels.length > 0 && (
        <div className="flex flex-wrap gap-0.5 border-b border-border pb-1">
          {channels.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => onChannelChange?.(ch)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                activeChannel === ch
                  ? 'bg-accent text-white'
                  : 'bg-background-primary text-text-secondary hover:text-text-primary'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
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
    </div>
  );
}
