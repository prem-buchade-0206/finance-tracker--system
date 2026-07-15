// src/shared/components/Button/Button.tsx

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, useCallback, useRef, type JSX, type ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

// ----------------------------------------------------------------------------
// 1. VARIANT MAPS — plain objects, not a cva dependency. Kept as explicit
// Record<Variant, string> maps so adding a variant is a one-line diff and
// TypeScript enforces every variant has an entry (no silently-missing case).
// ----------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-text-inverse shadow-sm hover:bg-brand-primary-hover hover:shadow-md',
  secondary:
    'bg-subtle text-text-primary border border-border-default hover:bg-muted',
  ghost: 'bg-transparent text-text-secondary hover:bg-subtle hover:text-text-primary',
  danger: 'bg-danger text-text-inverse shadow-sm hover:opacity-90 hover:shadow-md',
  glass: 'glass-surface text-text-primary hover:shadow-lg',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

// ----------------------------------------------------------------------------
// 2. MAGNETIC HOVER PHYSICS
// The button visually leans a few px toward the cursor on hover, snapping
// back with a spring on mouse leave. Strength is deliberately small (8px
// max) — anything larger reads as gimmicky rather than premium, and large
// magnetic offsets on small touch targets hurt usability on hybrid
// touch/pointer devices.
// ----------------------------------------------------------------------------

const MAGNETIC_STRENGTH = 8;

function useMagneticHover(): {
  ref: React.RefObject<HTMLButtonElement>;
  onMouseMove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave: () => void;
  x: number;
  y: number;
} {
  const ref = useRef<HTMLButtonElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
    positionRef.current = {
      x: relativeX * MAGNETIC_STRENGTH,
      y: relativeY * MAGNETIC_STRENGTH,
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    positionRef.current = { x: 0, y: 0 };
  }, []);

  return { ref, onMouseMove, onMouseLeave, ...positionRef.current };
}

// ----------------------------------------------------------------------------
// 3. LOADING SPINNER — tiny inline SVG, not an icon-library import, since
// this is the one icon guaranteed to be needed before lucide-react's tree-
// shaking has a chance to matter and it avoids a circular concern (Button
// shouldn't depend on how icons are chosen elsewhere).
// ----------------------------------------------------------------------------

function Spinner({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// 4. BUTTON
// ----------------------------------------------------------------------------

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Disables the magnetic hover effect — use for buttons inside dense
   *  toolbars/tables where the offset motion is more distracting than premium. */
  disableMagnetic?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disableMagnetic = false,
      disabled,
      className,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const magnetic = useMagneticHover();
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={(node) => {
          // Support both the forwarded ref AND the internal magnetic-hover
          // ref pointing at the same DOM node.
          magnetic.ref.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type={rest.type ?? 'button'}
        disabled={isDisabled}
        aria-busy={isLoading}
        onMouseMove={disableMagnetic ? undefined : magnetic.onMouseMove}
        onMouseLeave={disableMagnetic ? undefined : magnetic.onMouseLeave}
        animate={disableMagnetic ? undefined : { x: magnetic.x, y: magnetic.y }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        className={cn(
          'btn-magnetic inline-flex items-center justify-center font-semibold',
          'transition-colors duration-fast ease-standard',
          'disabled:cursor-not-allowed disabled:opacity-50',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...rest}
      >
        {isLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span className={isLoading ? 'opacity-70' : undefined}>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
