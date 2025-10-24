import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes dengan deduplication
 * Standard utility untuk Magic UI / shadcn components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

