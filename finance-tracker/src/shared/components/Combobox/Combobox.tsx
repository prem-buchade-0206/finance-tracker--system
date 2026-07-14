// src/shared/components/Combobox/Combobox.tsx
// Searchable single-select built on cmdk's <Command> primitive, which
// already handles the hard parts (roving tabindex, type-ahead filtering,
// ARIA listbox semantics) — this component owns only the trigger/popover
// chrome and viewport-aware positioning cmdk itself doesn't provide.

import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
} from 'react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useEscapeKey } from '@/shared/hooks/useEscapeKey';
import { cn } from '@/shared/utils/cn';

export interface ComboboxOption<TValue extends string> {
  value: TValue;
  label: string;
  /** Optional leading visual (icon, color swatch) — e.g. a category's icon
   *  and color dot when this powers the category picker. */
  icon?: JSX.Element;
  description?: string;
}

export interface ComboboxProps<TValue extends string> {
  options: readonly ComboboxOption<TValue>[];
  value: TValue | null;
  onChange: (value: TValue) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  emptyMessage?: string;
  hideLabel?: boolean;
}

export function Combobox<TValue extends string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  error,
  disabled,
  emptyMessage = 'No results found.',
  hideLabel = false,
}: ComboboxProps<TValue>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number; width: number }>();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);
  useEscapeKey(isOpen, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value) ?? null;

  // Recompute popover position whenever it opens — anchors below the
  // trigger, but flips above if there isn't enough viewport space below
  // (common case: combobox near the bottom of a modal or a short viewport).
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedPopoverHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlipUp = spaceBelow < estimatedPopoverHeight && rect.top > estimatedPopoverHeight;

    setPopoverStyle({
      top: shouldFlipUp ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [isOpen]);

  // Reposition on scroll/resize while open — a combobox inside a scrollable
  // modal body needs this or the popover visually detaches from its trigger.
  useEffect(() => {
    if (!isOpen) return;
    function reposition(): void {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverStyle((prev) =>
        prev ? { ...prev, top: rect.bottom + 8, left: rect.left, width: rect.width } : prev,
      );
    }
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen]);

  const triggerId = 'combobox-trigger';
  const listId = 'combobox-list';

  return (
    <div ref={containerRef} className="w-full">
      {label && (
        <label
          htmlFor={triggerId}
          className={cn(
            'mb-1.5 block text-sm font-medium text-text-primary',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border bg-surface px-3.5 text-left text-sm',
          'transition-colors duration-fast ease-standard',
          'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-text-disabled',
          error
            ? 'border-danger focus-visible:border-danger'
            : 'border-border-default focus-visible:border-border-focus',
        )}
      >
        <span className={cn('flex items-center gap-2 truncate', !selectedOption && 'text-text-tertiary')}>
          {selectedOption?.icon}
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronIcon className={cn('shrink-0 text-text-tertiary transition-transform duration-fast', isOpen && 'rotate-180')} />
      </button>

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}

      <AnimatePresence>
        {isOpen && popoverStyle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: popoverStyle.top,
              left: popoverStyle.left,
              width: popoverStyle.width,
            }}
            className="glass-surface-strong z-popover overflow-hidden rounded-xl shadow-lg"
          >
            <Command loop>
              <Command.Input
                autoFocus
                placeholder={searchPlaceholder}
                className="w-full border-b border-border-subtle bg-transparent px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              <Command.List id={listId} className="max-h-60 overflow-y-auto p-1.5">
                <Command.Empty className="px-3 py-6 text-center text-sm text-text-tertiary">
                  {emptyMessage}
                </Command.Empty>

                {options.map((option) => (
                  <Command.Item
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary',
                      'data-[selected=true]:bg-brand-primary data-[selected=true]:text-text-inverse',
                    )}
                  >
                    {option.icon}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && <CheckIcon className="shrink-0" />}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
