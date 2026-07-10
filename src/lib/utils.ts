import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Whole days between an ISO date and now (now − then), floored.
 * Negative if the date is in the future. Used by recency feeds.
 */
export function daysSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  return Math.floor((now.getTime() - then) / 86_400_000);
}

/** True when `iso` falls within the last `days` days (inclusive), not in the future. */
export function isWithinDays(iso: string, days: number, now: Date = new Date()): boolean {
  const d = daysSince(iso, now);
  return d >= 0 && d <= days;
}
