import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateByLocale(dateString: string | undefined, locale?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const userLocale = locale || (typeof window !== "undefined" ? navigator.language : "en-US");
  return new Intl.DateTimeFormat(userLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
