// src/shared/hooks/useClickOutside.ts

import { useEffect, useRef, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  onOutsideClick: () => void,
  isActive: boolean,
): RefObject<T> {
  const ref = useRef<T>(null);
  const callbackRef = useRef(onOutsideClick);
  callbackRef.current = onOutsideClick;

  useEffect(() => {
    if (!isActive) return;

    function handlePointerDown(event: PointerEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callbackRef.current();
      }
    }

    // pointerdown (not click) fires before focus shifts, so a click that
    // starts outside and would otherwise steal focus mid-interaction still
    // closes the popover before that happens.
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isActive]);

  return ref;
}
