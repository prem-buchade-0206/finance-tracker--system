// src/shared/components/Input/CurrencyInput.tsx
// Deliberately uses the "digit accumulator" masking pattern (same one most
// banking apps use for amount entry) rather than trying to parse/reformat
// a free-text decimal string on every keystroke. Free-text currency masking
// has a well-known hard problem: reformatting the display string while
// preserving cursor position through every possible edit (backspace mid-
// string, paste, selection-replace) is genuinely difficult to get fully
// correct. The digit-accumulator sidesteps it entirely: keystrokes append/
// remove from a raw digit string, and the formatted display always
// re-renders with the cursor pinned to the end — which matches how people
// actually type amounts (left-to-right, smallest unit last) in practice.

import { forwardRef, useId, type JSX } from 'react';

import { CURRENCY_META, formatCurrency } from '@/shared/utils/currency';
import { cn } from '@/shared/utils/cn';
import type { CurrencyCode, MinorUnits } from '@/shared/types';

export interface CurrencyInputProps {
  /** Current value in integer minor units (paise/cents) — never a float. */
  value: MinorUnits;
  onChange: (value: MinorUnits) => void;
  currency: CurrencyCode;
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  placeholder?: string;
  hideLabel?: boolean;
  containerClassName?: string;
  /** Max value in minor units — prevents typing an amount beyond what a
   *  field realistically supports (e.g. avoids overflow in downstream math). */
  max?: MinorUnits;
}

const SIZE_CLASSES: Record<NonNullable<CurrencyInputProps['size']>, string> = {
  sm: 'h-9 text-xs',
  md: 'h-11 text-sm',
  lg: 'h-13 text-lg font-semibold',
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      currency,
      label,
      error,
      helperText,
      size = 'md',
      disabled,
      placeholder,
      hideLabel = false,
      containerClassName,
      max,
    },
    ref,
  ): JSX.Element => {
    const generatedId = useId();
    const inputId = generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const meta = CURRENCY_META[currency];

    const displayValue =
      value === 0
        ? ''
        : formatCurrency({ amount: value, currency }, { showSymbol: false });

    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
      // Strip everything except digits — this is what makes the pattern
      // robust: it doesn't matter what the user typed, pasted, or deleted,
      // only the resulting digit sequence matters.
      const digitsOnly = event.target.value.replace(/\D/g, '');

      if (digitsOnly === '') {
        onChange(0 as MinorUnits);
        return;
      }

      // Cap the digit string length so values don't grow unboundedly —
      // 12 digits covers up to 9,999,999,999.99 in any supported currency,
      // comfortably beyond realistic personal-finance amounts.
      const capped = digitsOnly.slice(0, 12);
      const parsed = parseInt(capped, 10) as MinorUnits;
      const finalValue = max && parsed > max ? max : parsed;

      onChange(finalValue);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
      // Backspace removes the last DIGIT of the underlying value, not the
      // last character of the formatted display (which might be a comma
      // or the decimal separator) — otherwise backspace on "1,234.00"
      // would appear to do nothing when it hits a separator character.
      if (event.key === 'Backspace' && value !== 0) {
        event.preventDefault();
        const digits = value.toString().slice(0, -1);
        onChange((digits === '' ? 0 : parseInt(digits, 10)) as MinorUnits);
      }
    }

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1.5 block text-sm font-medium text-text-primary',
              hideLabel && 'sr-only',
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <span
            className={cn(
              'pointer-events-none absolute left-3.5 font-mono text-text-tertiary',
              size === 'lg' ? 'text-lg' : 'text-sm',
            )}
          >
            {meta.symbol}
          </span>

          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder ?? '0.00'}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            data-numeric="true"
            className={cn(
              'w-full rounded-xl border bg-surface pl-9 pr-3.5 text-right text-text-primary',
              'placeholder:text-text-tertiary',
              'transition-colors duration-fast ease-standard',
              'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-text-disabled',
              error
                ? 'border-danger focus-visible:border-danger'
                : 'border-border-default focus-visible:border-border-focus',
              SIZE_CLASSES[size],
            )}
          />
        </div>

        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-xs text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
