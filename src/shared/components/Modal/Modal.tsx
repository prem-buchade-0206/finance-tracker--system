// src/shared/components/Modal/Modal.tsx
// Portal-rendered so the modal's stacking context is never affected by an
// ancestor's `overflow: hidden`, `transform`, or `z-index` — the exact bug
// class that causes "modal renders behind/clipped by parent" issues, which
// this component prevents at the architecture level rather than patching
// per-instance with ad-hoc z-index bumps.

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, type JSX, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useEscapeKey } from '@/shared/hooks/useEscapeKey';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/shared/hooks/useLockBodyScroll';
import { cn } from '@/shared/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Visually hides the title (still read by screen readers via aria-labelledby)
   *  for modals with custom, non-text headers. */
  hideTitle?: boolean;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Disables closing via backdrop click — use for destructive confirmation
   *  modals where an accidental outside click shouldn't dismiss silently. */
  disableBackdropClose?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  size = 'md',
  disableBackdropClose = false,
}: ModalProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = 'modal-title';
  const descriptionId = 'modal-description';

  useLockBodyScroll(isOpen);
  useFocusTrap(containerRef, isOpen);
  useEscapeKey(isOpen, onClose);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={disableBackdropClose ? undefined : onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={cn(
              'glass-surface-strong relative z-modal flex max-h-[85dvh] w-full flex-col rounded-2xl',
              SIZE_CLASSES[size],
            )}
          >
            <div className="flex items-start justify-between border-b border-border-subtle px-6 py-4">
              <div>
                <h2
                  id={titleId}
                  className={cn(
                    'font-display text-lg font-semibold text-text-primary',
                    hideTitle && 'sr-only',
                  )}
                >
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-text-secondary">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-text-tertiary transition-colors duration-fast hover:bg-subtle hover:text-text-primary"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
