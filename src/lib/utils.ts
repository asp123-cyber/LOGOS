import DOMPurify from 'dompurify';

/**
 * Generate a URL-safe slug from a title, with optional suffix for collision handling.
 */
export function slugify(title: string, suffix?: string): string {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (suffix) {
    slug = `${slug}-${suffix}`;
  }
  return slug.slice(0, 120);
}

/**
 * Sanitize HTML content for safe rendering.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'h4',
      'blockquote', 'ul', 'ol', 'li', 'img', 'pre', 'code', 'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Estimate reading time for article content (words per minute).
 */
export function readingTime(text: string, wpm = 230): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Extract plain text from TipTap JSON content.
 */
export function extractTextFromContent(content: Record<string, unknown>): string {
  const parts: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (node['text'] && typeof node['text'] === 'string') {
      parts.push(node['text']);
    }
    if (Array.isArray(node['content'])) {
      for (const child of node['content']) {
        walk(child as Record<string, unknown>);
      }
    }
  }

  walk(content);
  return parts.join(' ');
}

/**
 * Format a date in a human-readable way.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date as a short string.
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Truncate text to a maximum length, preserving whole words.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

/**
 * Generate initials from a display name for avatar fallback.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Validate image file for upload.
 */
export function validateImageFile(
  file: File,
  maxSizeMB = 5
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed.' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${maxSizeMB}MB.` };
  }
  return { valid: true };
}

/**
 * Categories available for articles.
 */
export const CATEGORIES = [
  'Ideas',
  'Philosophy',
  'Science',
  'Technology',
  'Culture',
  'History',
  'Mathematics',
  'Literature',
  'Politics',
  'Education',
] as const;

export type Category = (typeof CATEGORIES)[number];
