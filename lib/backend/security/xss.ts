/**
 * ALAYA INSIDER — XSS Prevention via DOMPurify
 * Sanitize all user-generated content before rendering or storing.
 */

import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a server-side DOMPurify instance using JSDOM window
const dom = new JSDOM("");
const purify = DOMPurify(dom.window as any);

/**
 * Strict sanitization for basic text content (comments, reviews, bios)
 * Strips ALL HTML tags — only plain text remains
 */
export function sanitizeText(input: string): string {
  return String(purify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    FORBID_PROTOCOLS: ["javascript", "data", "vbscript"],
  } as any));
}

/**
 * Moderate sanitization for rich text (article content, descriptions)
 * Allows safe HTML tags commonly used in editorial content
 */
export function sanitizeRichText(input: string): string {
  return String(purify.sanitize(input, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "u", "s",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img", "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "hr", "span", "div", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "id", "width", "height"],
    ALLOW_DATA_ATTR: false,
    FORBID_PROTOCOLS: ["javascript", "data", "vbscript"],
    ADD_ATTR: ["rel"],
  } as any));
}

/**
 * Sanitize HTML attributes only (for single values like titles, names)
 */
export function sanitizeAttribute(input: string): string {
  return String(purify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    FORBID_PROTOCOLS: ["javascript", "data", "vbscript"],
  } as any));
}

/**
 * Validate and sanitize a URL, ensuring it's safe
 * Returns null if the URL is unsafe
 */
export function sanitizeUrl(url: string): string | null {
  const sanitized = String(purify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  } as any));

  // Only allow http, https, mailto, and tel protocols
  const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
  try {
    const parsed = new URL(sanitized);
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    return sanitized;
  } catch {
    return null;
  }
}
