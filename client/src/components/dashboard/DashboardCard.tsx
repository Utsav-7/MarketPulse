import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  badge?: string;
  headerRight?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** When true, adds a drag handle in the header (use with react-grid-layout draggableHandle) */
  dragHandle?: boolean;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  badge,
  headerRight,
  onRefresh,
  refreshing,
  dragHandle,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-lg border border-border bg-background-secondary overflow-hidden ${className}`}
    >
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border bg-background-primary px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {dragHandle && (
            <span
              className="dashboard-card-drag-handle cursor-grab touch-none rounded p-0.5 text-text-secondary hover:text-text-primary active:cursor-grabbing"
              title="Drag to move"
              aria-hidden
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </span>
          )}
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-primary truncate">
            {title}
          </h2>
          {badge && (
            <span className="rounded bg-accent/20 px-1 py-0.5 text-[10px] font-medium text-accent shrink-0">
              {badge}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {headerRight}
          {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded p-1.5 text-text-secondary hover:bg-background-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
            title="Refresh"
            aria-label="Refresh"
          >
            <svg
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </div>
  );
}
