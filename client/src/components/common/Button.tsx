import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-accent text-white hover:bg-blue-600',
    secondary: 'bg-background-secondary text-text-primary border border-border hover:bg-slate-700',
    ghost: 'text-text-secondary hover:bg-background-secondary hover:text-text-primary',
  };
  const width = fullWidth ? 'w-full' : '';
  return (
    <button
      className={`${base} ${variants[variant]} ${width} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
