import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isEqual } from "@ngard/tiny-isequal";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDeepEqual(a: unknown, b: unknown): boolean {
  return isEqual(a, b);
}