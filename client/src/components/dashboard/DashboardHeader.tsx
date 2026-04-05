import { useEffect, useState } from 'react';
import { Button, MarketPulseLogo } from '../common';

interface DashboardHeaderProps {
  username: string | null;
  onLogout: () => void;
}

function formatDashboardDate(date: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const d = date.getDate();
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${day}, ${d} ${month} ${year} ${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  const [dateTime, setDateTime] = useState(() => formatDashboardDate(new Date()));

  useEffect(() => {
    const t = setInterval(() => {
      setDateTime(formatDashboardDate(new Date()));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background-secondary px-3 py-2">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center shrink-0">
          <MarketPulseLogo size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
            {dateTime}
          </span>
          <span className="text-xs text-text-secondary">
            <span className="text-text-primary">@{username ?? '—'}</span>
          </span>
          <Button variant="secondary" onClick={onLogout} className="py-1 text-xs">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
