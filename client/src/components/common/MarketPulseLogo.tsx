interface MarketPulseLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function MarketPulseLogo({ size = 'md' }: MarketPulseLogoProps) {
  const sizes = {
    sm: { icon: 20, textClass: 'text-sm', gap: 'gap-1.5' },
    md: { icon: 28, textClass: 'text-base', gap: 'gap-2' },
    lg: { icon: 40, textClass: 'text-2xl', gap: 'gap-3' },
  };
  const { icon, textClass, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap} select-none`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background rounded square */}
        <rect width="32" height="32" rx="7" fill="#1e40af" opacity="0.15" />

        {/* Bar chart bars */}
        <rect x="4" y="20" width="4" height="8" rx="1" fill="#3b82f6" opacity="0.5" />
        <rect x="10" y="14" width="4" height="14" rx="1" fill="#3b82f6" opacity="0.7" />
        <rect x="16" y="9" width="4" height="19" rx="1" fill="#3b82f6" opacity="0.9" />

        {/* Pulse / signal line overlay */}
        <polyline
          points="14,16 18,8 22,22 26,14 30,14"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Glowing dot at end of pulse */}
        <circle cx="30" cy="14" r="1.5" fill="#93c5fd" />
      </svg>

      <span className={`font-semibold tracking-tight leading-none ${textClass}`}>
        <span className="text-text-primary">Market</span>
        <span className="text-accent font-bold">Pulse</span>
      </span>
    </div>
  );
}
