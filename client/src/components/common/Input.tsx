import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-background-secondary px-3 py-2.5 text-text-primary placeholder-text-secondary outline-none transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 ${
          error ? 'border-negative' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-negative">{error}</p>}
    </div>
  );
}
