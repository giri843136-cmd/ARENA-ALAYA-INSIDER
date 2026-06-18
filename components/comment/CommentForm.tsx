"use client";

import { useState, useCallback } from "react";
import { Send, Loader2, ShieldAlert } from "lucide-react";

// Client-side XSS sanitization before submission (defense in depth)
function sanitizeComment(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")             // strip all HTML tags
    .replace(/javascript\s*:/gi, "")    // strip javascript: protocol
    .replace(/on\w+\s*=/gi, "")         // strip event handlers (onclick, onerror, etc.)
    .replace(/data\s*:\s*text\/html/gi, "") // strip dangerous data URIs
    .trim();
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void> | void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts...",
  submitLabel = "Post Comment",
  initialValue = "",
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    // Sanitize content before submission (defense in depth)
    const sanitized = sanitizeComment(content.trim());
    if (!sanitized) {
      setError("Comment content is not valid after security check.");
      return;
    }

    // Check for suspicious content
    if (sanitized.length < content.trim().length * 0.5) {
      setError("Comment contains blocked content. Please remove any HTML tags or scripting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(sanitized);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="input resize-none text-sm"
        maxLength={5000}
        disabled={isSubmitting}
      />

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#8A8178] dark:text-[#64748B]">
          {content.length}/5000
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[#8A8178] hover:text-[#6D655F] px-3 py-1.5 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="btn btn-sm btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
