// src/shared/utils/cn.ts
// Combines clsx (conditional class logic) with tailwind-merge (resolves
// conflicting Tailwind utilities, e.g. a base `px-4` overridden by a
// prop-supplied `px-6` keeps only the latter instead of shipping both to
// the DOM where CSS cascade order — not intent — would decide the winner).

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
