// src/shared/hooks/useLockBodyScroll.ts
// Locks page scroll while a modal is open. The naive `overflow: hidden` on
// <body> causes a layout shift when the scrollbar disappears — content
// visibly jumps right by the scrollbar's width. This compensates by adding
// that exact width back as right padding, so nothing shifts.

import { useEffect } from 'react';

export function useLockBodyScroll(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(
        window.getComputedStyle(document.body).paddingRight,
      );
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
