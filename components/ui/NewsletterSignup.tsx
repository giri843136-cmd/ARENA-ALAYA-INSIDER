"use client";

import { useState } from "react";
import { Mail, Check, Loader2, AlertCircle } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "footer";
  className?: string;
  source?: string;
}

/**
 * Newsletter signup form with email validation, loading state, and success message.
 * Integrates with the /api/v1/newsletter/subscribe endpoint.
 */
export function NewsletterSignup({ variant = "inline", className = "", source = "web" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setMessage(json.data?.message || "Check your inbox to confirm your subscription.");
      } else {
        setStatus("error");
        setMessage(json.error?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 ${variant === "card" ? "p-6 bg-white rounded-2xl border border-[#E4DDD5]" : ""} ${className}`}>
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={18} className="text-green-600" />
        </div>
        <div>            <div className="text-sm font-medium text-[#26221E]">You&apos;re subscribed!</div>
          <p className="text-xs text-[#6D655F] mt-0.5">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`p-6 bg-white rounded-2xl border border-[#E4DDD5] ${className}`}>
        <div className="text-sm font-medium text-[#26221E] mb-1">Join the circle</div>
        <p className="text-xs text-[#6D655F] mb-4">One beautiful object, one essay, three obsessions — delivered Sunday.</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 px-3 py-2 text-sm border border-[#E4DDD5] rounded-lg focus:border-[#7A6848] outline-none" required aria-label="Email for newsletter" />
          <button type="submit" disabled={status === "loading"} className="px-4 py-2 bg-[#7A6848] text-white text-sm rounded-lg hover:bg-[#B89A7A] disabled:opacity-50 transition-colors">
            {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
          </button>
        </form>
        {status === "error" && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} />{message}</p>}
      </div>
    );
  }

  // Inline / footer variant
  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5249]" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-9 pr-3 py-2 text-sm border border-[#E4DDD5] rounded-lg focus:border-[#7A6848] outline-none" required aria-label="Email for newsletter" />
      </div>
      <button type="submit" disabled={status === "loading"} className="px-4 py-2 bg-[#7A6848] text-white text-sm rounded-lg hover:bg-[#B89A7A] disabled:opacity-50 transition-colors whitespace-nowrap">
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
      </button>
      {status === "error" && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{message}</p>}
    </form>
  );
}
