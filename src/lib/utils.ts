import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(".", ",") + "K";
  return num.toString();
}
