/**
 * Converts a string to a URL-friendly slug
 * Example: "UK Policing Tech Audit: Why Modernisation Can't Wait" 
 * -> "uk-policing-tech-audit-why-modernisation-cant-wait"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

