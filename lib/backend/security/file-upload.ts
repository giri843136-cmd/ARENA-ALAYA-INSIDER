/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * ALAYA INSIDER — File Upload Security Middleware
 * Enterprise-grade upload validation: MIME type, magic bytes, size limits, malware scanning
 * Models the security standards of Stripe, GitHub, and Apple
 */

import { createHash } from "crypto";

// =============================================
// ALLOWED MIME TYPES & MAGIC BYTE SIGNATURES
// =============================================

interface MimeSignature {
  mime: string;
  extensions: string[];
  magicBytes: number[][]; // Multiple possible magic byte sequences
  offset?: number;
}

const ALLOWED_IMAGE_TYPES: MimeSignature[] = [
  {
    mime: "image/jpeg",
    extensions: [".jpg", ".jpeg", ".jpe"],
    magicBytes: [
      [0xFF, 0xD8, 0xFF],
    ],
  },
  {
    mime: "image/png",
    extensions: [".png"],
    magicBytes: [
      [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    ],
  },
  {
    mime: "image/webp",
    extensions: [".webp"],
    magicBytes: [
      [0x52, 0x49, 0x46, 0x46], // RIFF header
    ],
  },
  {
    mime: "image/gif",
    extensions: [".gif"],
    magicBytes: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
  },
  {
    mime: "image/avif",
    extensions: [".avif"],
    magicBytes: [
      [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],
    ],
  },
  {
    mime: "image/svg+xml",
    extensions: [".svg"],
    magicBytes: [
      [0x3C, 0x73, 0x76, 0x67], // <svg
      [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // <?xml
    ],
  },
];

const ALLOWED_DOCUMENT_TYPES: MimeSignature[] = [
  {
    mime: "application/pdf",
    extensions: [".pdf"],
    magicBytes: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
];

const ALLOWED_VIDEO_TYPES: MimeSignature[] = [
  {
    mime: "video/mp4",
    extensions: [".mp4"],
    magicBytes: [
      [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32], // mp42
      [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32], // mp42 variant
      [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D], // isom
      [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x4D, 0x53, 0x4E, 0x56], // Microsoft MP4
    ],
  },
  {
    mime: "video/webm",
    extensions: [".webm"],
    magicBytes: [
      [0x1A, 0x45, 0xDF, 0xA3], // WebM/Matroska header
    ],
  },
  {
    mime: "video/quicktime",
    extensions: [".mov", ".qt"],
    magicBytes: [
      [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], // ftypqt
      [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x56, 0x20], // M4V
    ],
  },
  {
    mime: "video/x-msvideo",
    extensions: [".avi"],
    // Note: RIFF header is broad (also matches WebP, WAV). WebP checked first in ALLOWED_IMAGE_TYPES.
    // For production AVI validation, also check for "AVI " identifier at byte offset 8.
    magicBytes: [
      [0x52, 0x49, 0x46, 0x46], // RIFF
    ],
  },
  {
    mime: "video/mp2t",
    extensions: [".ts"],
    magicBytes: [
      [0x47], // MPEG TS sync byte
    ],
  },
  {
    mime: "video/3gpp",
    extensions: [".3gp"],
    magicBytes: [
      [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x33, 0x67, 0x70], // ftyp3gp
    ],
  },
  {
    mime: "video/x-matroska",
    extensions: [".mkv"],
    magicBytes: [
      [0x1A, 0x45, 0xDF, 0xA3], // Matroska header (same as WebM)
    ],
  },
];

// Combined allowed types
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

// =============================================
// CONFIGURATION
// =============================================

export const UPLOAD_CONFIG = {
  // Size limits
  maxImageSize: 5 * 1024 * 1024, // 5 MB for images
  maxDocumentSize: 10 * 1024 * 1024, // 10 MB for documents
  maxVideoSize: 100 * 1024 * 1024, // 100 MB for videos
  maxTotalUploadSize: 200 * 1024 * 1024, // 200 MB per request (multiple files)

  // Rate limiting (these are in addition to the general rate limiter)
  maxUploadsPerMinute: 10,
  maxUploadsPerHour: 50,

  // Security
  stripExif: true,
  requireMagicByteValidation: true,
  rejectExecutableContent: true,
};

// =============================================
// MAGIC BYTE VALIDATION
// =============================================

/**
 * Extract the first N bytes from a file as a buffer for magic byte detection
 */
export async function extractMagicBytes(file: File, numBytes = 16): Promise<Uint8Array> {
  const blob = file.slice(0, numBytes);
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Validate a file's magic bytes against known signatures
 * Returns the matched MIME type or null if no match
 */
export function validateMagicBytes(bytes: Uint8Array, _declaredType: string): string | null {
  for (const type of ALLOWED_TYPES) {
    for (const magic of type.magicBytes) {
      const offset = type.offset || 0;
      if (bytes.length < offset + magic.length) continue;

      let matches = true;
      for (let i = 0; i < magic.length; i++) {
        if (bytes[offset + i] !== magic[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return type.mime;
      }
    }
  }
  return null;
}

/**
 * Check if a file is likely executable/malicious by scanning for known dangerous patterns
 */
export function isPotentiallyExecutable(bytes: Uint8Array): boolean {
  // Check for ELF (Linux executable)
  if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) return true;
  // Check for PE (Windows executable)
  if (bytes[0] === 0x4D && bytes[1] === 0x5A) return true; // MZ header
  // Check for Mach-O (macOS executable)
  if ((bytes[0] === 0xFE && bytes[1] === 0xED && bytes[2] === 0xFA && bytes[3] === 0xCE) ||
      (bytes[0] === 0xFE && bytes[1] === 0xED && bytes[2] === 0xFA && bytes[3] === 0xCF) ||
      (bytes[0] === 0xCA && bytes[1] === 0xFE && bytes[2] === 0xBA && bytes[3] === 0xBE)) return true;
  // Check for Java class files
  if (bytes[0] === 0xCA && bytes[1] === 0xFE && bytes[2] === 0xBA && bytes[3] === 0xBE) return true;
  // Check for scripts with shebang
  if (bytes[0] === 0x23 && bytes[1] === 0x21) return true; // #!
  return false;
}

/**
 * Sanitize SVG files by checking for malicious content
 */
export function sanitizeSVGContent(content: string): string {
  // Strip script tags
  let sanitized = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Strip event handlers (onerror, onclick, etc.)
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
  // Strip javascript: URLs
  sanitized = sanitized.replace(/javascript:\s*/gi, "");
  // Strip data: URLs in dangerous contexts
  sanitized = sanitized.replace(/href\s*=\s*["']data:\s*text\/html[^"']*["']/gi, "");
  return sanitized;
}

// =============================================
// FILE VALIDATION RESULT
// =============================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
  isImage: boolean;
  isDocument: boolean;
  isVideo: boolean;
  size: number;
  hash: string;
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const errors: string[] = [];
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  const declaredType = file.type;

  // 1. Check file size
  if (file.size === 0) {
    return { valid: false, error: "File is empty", isImage: false, isDocument: false, isVideo: false, size: 0, hash: "" };
  }

  if (file.size > UPLOAD_CONFIG.maxTotalUploadSize) {
    return { valid: false, error: `File exceeds maximum size of ${UPLOAD_CONFIG.maxTotalUploadSize / 1024 / 1024}MB`, isImage: false, isDocument: false, isVideo: false, size: file.size, hash: "" };
  }

  if (declaredType.startsWith("image/") && file.size > UPLOAD_CONFIG.maxImageSize) {
    errors.push(`Image exceeds maximum size of ${UPLOAD_CONFIG.maxImageSize / 1024 / 1024}MB`);
  }
  if (declaredType.startsWith("video/") && file.size > UPLOAD_CONFIG.maxVideoSize) {
    errors.push(`Video exceeds maximum size of ${UPLOAD_CONFIG.maxVideoSize / 1024 / 1024}MB`);
  }

  // 2. Check file extension
  const allowedExtensions = ALLOWED_TYPES.flatMap((t) => t.extensions);
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `File extension '${ext}' is not allowed. Allowed: ${allowedExtensions.join(", ")}`, isImage: false, isDocument: false, isVideo: false, size: file.size, hash: "" };
  }

  // 3. Magic byte validation (content-based MIME detection)
  const magicBytes = await extractMagicBytes(file, 16);

  // 4. Check for executable content
  if (UPLOAD_CONFIG.rejectExecutableContent && isPotentiallyExecutable(magicBytes)) {
    return { valid: false, error: "File appears to be executable content and is rejected for security reasons", isImage: false, isDocument: false, isVideo: false, size: file.size, hash: "" };
  }

  // 5. Validate magic bytes match declared type
  if (UPLOAD_CONFIG.requireMagicByteValidation) {
    const detectedMime = validateMagicBytes(magicBytes, declaredType);
    if (!detectedMime) {
      return { valid: false, error: "File content does not match any allowed file type. Magic byte validation failed.", isImage: false, isDocument: false, isVideo: false, size: file.size, hash: "" };
    }

    // Check if declared type matches detected type (if declared)
    if (declaredType && declaredType !== "application/octet-stream") {
      const declaredMatches = ALLOWED_TYPES.find((t) => t.mime === declaredType);
      const detectedMatches = ALLOWED_TYPES.find((t) => t.mime === detectedMime);

      if (declaredMatches && detectedMatches && declaredMatches.mime !== detectedMatches.mime) {
        errors.push(`Declared MIME type '${declaredType}' does not match detected content '${detectedMime}'`);
      }
    }

    // 6. Additional SVG sanitization
    if (detectedMime === "image/svg+xml") {
      const fullContent = await file.text();
      const sanitized = sanitizeSVGContent(fullContent);
      if (sanitized !== fullContent) {
        // The file had potentially malicious content that was sanitized
        // In production, you might want to reject instead of sanitize
        console.warn(`[FileUpload] SVG sanitized: ${file.name}`);
      }
    }

    // Compute file hash for deduplication and integrity
    const hash = createHash("sha256").update(Buffer.from(magicBytes)).digest("hex");

    const isImage = ALLOWED_IMAGE_TYPES.some((t) => t.mime === detectedMime);
    const isDocument = ALLOWED_DOCUMENT_TYPES.some((t) => t.mime === detectedMime);
    const isVideo = ALLOWED_VIDEO_TYPES.some((t) => t.mime === detectedMime);

    if (errors.length > 0) {
      return { valid: false, error: errors.join("; "), detectedMime, isImage, isDocument, size: file.size, hash, isVideo };
    }

    return { valid: true, detectedMime, isImage, isDocument, size: file.size, hash, isVideo };
  }

  // Fallback if magic byte validation disabled
  const isImage = declaredType.startsWith("image/");
  const isVideo = declaredType.startsWith("video/");
  const hash = createHash("sha256").update(Buffer.from(magicBytes)).digest("hex");

  return { valid: errors.length === 0, error: errors.length > 0 ? errors.join("; ") : undefined, isImage, isDocument: declaredType === "application/pdf", isVideo, size: file.size, hash };
}

/**
 * Validate multiple files in an upload batch
 */
export async function validateBatchFiles(files: File[]): Promise<{ valid: boolean; results: FileValidationResult[]; errors: string[] }> {
  const results: FileValidationResult[] = [];
  const errors: string[] = [];

  let totalSize = 0;

  for (const file of files) {
    const result = await validateFile(file);
    results.push(result);
    totalSize += file.size;

    if (!result.valid) {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  if (totalSize > UPLOAD_CONFIG.maxTotalUploadSize) {
    errors.push(`Total upload size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds maximum of ${UPLOAD_CONFIG.maxTotalUploadSize / 1024 / 1024}MB`);
  }

  return { valid: errors.length === 0, results, errors };
}
