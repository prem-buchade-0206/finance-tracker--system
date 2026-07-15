// src/shared/hooks/useEscapeKey.ts

import { useEffect, useRef } from 'react';

/** Fires `onEscape` while `isActive` is true and the Escape key is pressed.
 *  Kept separate from useFocusTrap deliberately — dismissal and focus-
 *  cycling are distinct concerns, and some future caller may want a modal
 *  that traps focus but ignores Escape (e.g. a mandatory onboarding step). */
export function useEscapeKey(isActive: boolean, onEscape: () => void): void {
  // Ref indirection so the effect doesn't need onEscape in its dependency
  // array — callers frequently pass an inline arrow function, and without
  // this the listener would be torn down/re-added on every parent render.
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onEscapeRef.current();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
}
