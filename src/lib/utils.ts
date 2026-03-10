import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, addDays, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GestationalAge {
  weeks: number;
  days: number;
}

/**
 * Calculates current gestational age based on a reference date and the gestational age on that date.
 */
export function calculateCurrentGestationalAge(
  refDate: Date,
  refWeeks: number,
  refDays: number
): GestationalAge {
  const diffDays = differenceInDays(new Date(), refDate);
  const totalDays = refWeeks * 7 + refDays + diffDays;
  
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
  };
}

/**
 * Calculates EDD (Expected Delivery Date) based on gestational age.
 * Standard pregnancy is 40 weeks (280 days).
 */
export function calculateEDD(refDate: Date, refWeeks: number, refDays: number): Date {
  const currentTotalDays = refWeeks * 7 + refDays;
  const remainingDays = 280 - currentTotalDays;
  return addDays(refDate, remainingDays);
}

export function formatGestationalAge(ga: GestationalAge): string {
  return `${ga.weeks}周${ga.days}天`;
}
