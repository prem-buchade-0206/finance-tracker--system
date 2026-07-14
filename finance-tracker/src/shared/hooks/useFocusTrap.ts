// src/shared/hooks/useFocusTrap.ts
// Keeps keyboard focus cycling within the modal (Tab/Shift+Tab never
// escapes to background content) and restores focus to whatever element
// triggered the modal once it closes — both are WCAG 2.1 requirements for
// dialog-pattern components (2.4.3 Focus Order, 2.1.2 No Keyboard Trap's
// inverse: intentional, bounded trapping is the correct pattern for modals).

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
): void {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    const focusableElements = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const firstElement = focusableElements?.[0];
    // Move focus into the modal on open — without this, focus stays on
    // whatever was focused in the background, and a screen reader user
    // gets no indication the modal even opened.
    firstElement?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Tab' || !container) return;

      const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger element — e.g. the "Add Transaction"
      // button that opened the modal — so keyboard users don't lose their
      // place in the page after closing.
      previouslyFocusedElement.current?.focus();
    };
  }, [isActive, containerRef]);
}
