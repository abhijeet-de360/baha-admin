import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate slug using slugify package
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}
