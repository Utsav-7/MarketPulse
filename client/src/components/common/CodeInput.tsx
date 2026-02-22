import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

const ALPHANUMERIC = /^[A-Za-z0-9]$/;

export function CodeInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
  autoFocus = false,
}: CodeInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.toUpperCase().padEnd(length, '').split('').slice(0, length);

  const focusIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, length - 1));
      inputsRef.current[clamped]?.focus();
    },
    [length],
  );

  const updateValue = useCallback(
    (newChars: string[]) => onChange(newChars.join('')),
    [onChange],
  );

  const handleInput = useCallback(
    (i: number, char: string) => {
      if (!ALPHANUMERIC.test(char)) return;
      const next = [...chars];
      next[i] = char.toUpperCase();
      updateValue(next);
      if (i < length - 1) focusIndex(i + 1);
    },
    [chars, length, focusIndex, updateValue],
  );

  const handleKeyDown = useCallback(
    (i: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const next = [...chars];
        if (chars[i]) {
          next[i] = '';
          updateValue(next);
        } else if (i > 0) {
          next[i - 1] = '';
          updateValue(next);
          focusIndex(i - 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusIndex(i - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusIndex(i + 1);
      }
    },
    [chars, focusIndex, updateValue],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text/plain')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, length);
      if (!pasted) return;
      onChange(pasted.padEnd(length, '').slice(0, length));
      focusIndex(Math.min(pasted.length, length - 1));
    },
    [length, onChange, focusIndex],
  );

  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="password"
            inputMode="text"
            maxLength={1}
            value={chars[i]?.trim() || ''}
            autoComplete="one-time-code"
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            className={`h-12 w-11 rounded-lg border bg-background-primary text-center text-lg font-semibold text-text-primary outline-none transition-all
              focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-secondary
              disabled:opacity-50
              ${error ? 'border-negative' : 'border-border hover:border-accent/60'}`}
            onChange={(e) => {
              const v = e.target.value;
              if (v && ALPHANUMERIC.test(v[v.length - 1])) handleInput(i, v[v.length - 1]);
            }}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Code digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-sm text-negative">{error}</p>}
    </div>
  );
}
