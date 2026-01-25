import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createRecipeSlug(method: string, id: string): string {
  const methodSlug = method.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${methodSlug}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
  // UUIDs are 36 characters long. 
  // We assume the slug ends with the UUID.
  if (slug.length < 36) return slug;
  return slug.slice(-36);
}
