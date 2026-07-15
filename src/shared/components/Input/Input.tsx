// src/shared/components/Input/Input.tsx

import { forwardRef, useId, type InputHTMLAttributes, type JSX, type ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Error message — when present, overrides `helperText` and sets aria-invalid. */
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Renders the label visually hidden but still in the accessibility tree —
   *  use for compact inline inputs (e.g. table cell edit) that don't have
   *  room for a visible label but still need one for screen readers. */
  hideLabel?: boolean;
  containerClassName?: string;
}

const SIZE_CLASSES: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'h-9 text-xs px-3',
  md: 'h-11 text-sm px-3.5',
  lg: 'h-13 text-base px-4',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      hideLabel = false,
      containerClassName,
      className,
      id,
      required,
      ...rest
    },
    ref,
  ): JSX.Element => {
    // useId guarantees a stable, SSR-safe id even if the caller doesn't
    // pass one — label/input/error association must never rely on an
    // accidentally-duplicated hardcoded id across multiple form instances.
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const describedBy = error ? errorId : helperText ? helperId : undefined;

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
            {required && (
              <span className="ml-0.5 text-danger" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 flex text-text-tertiary">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={cn(
              'w-full rounded-xl border bg-surface text-text-primary',
              'placeholder:text-text-tertiary',
              'transition-colors duration-fast ease-standard',
              'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-text-disabled',
              error
                ? 'border-danger focus-visible:border-danger'
                : 'border-border-default focus-visible:border-border-focus',
              SIZE_CLASSES[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            {...rest}
          />

          {rightIcon && (
            <span className="absolute right-3.5 flex text-text-tertiary">{rightIcon}</span>
          )}
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

Input.displayName = 'Input';
