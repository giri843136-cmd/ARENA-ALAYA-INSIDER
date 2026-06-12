"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API (real would call backend)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 650);
  };

  if (submitted) {
    return (
      <div className="bg-[#F5F0EA] min-h-[70vh] flex items-center">
        <div className="container">
          <EmptyState
            title="Thank you."
            description="Your message is on its way to us. We read every note and reply within a few days."
            icon="search"
            actionLabel="Return home"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EA]">
      <div className="container max-w-xl py-20">
        <div className="max-w-md">
          <div className="text-xs tracking-[3px] text-[#C5AA8A] mb-2">WE’RE HERE</div>
          <h1 className="font-display text-[52px] tracking-[-2.2px]">Say hello.</h1>
          <p className="mt-3 text-[#5C5249] text-lg">We read every message. It may take us a few days, but we will reply.</p>
        </div>

        <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="text-xs tracking-widest text-[#8A8178] block mb-1.5">YOUR NAME</label>
              <input id="name" type="text" className="input" placeholder="Elena Voss" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="email" className="text-xs tracking-widest text-[#8A8178] block mb-1.5">EMAIL</label>
              <input id="email" type="email" className="input" placeholder="you@beautifulhome.com" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="message" className="text-xs tracking-widest text-[#8A8178] block mb-1.5">MESSAGE</label>
              <textarea id="message" className="input h-40" placeholder="I wanted to tell you how much I love the linen duvet..." required aria-required="true" />
            </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>

        <div className="mt-16 pt-8 border-t border-[#E4DDD5] text-sm text-[#8A8178] space-y-1">
          For press inquiries: <a href="mailto:press@alayainsider.com" className="underline hover:text-[#C5AA8A]">press@alayainsider.com</a><br />
          For brand partnerships: <a href="mailto:partnerships@alayainsider.com" className="underline hover:text-[#C5AA8A]">partnerships@alayainsider.com</a>
        </div>
      </div>
    </div>
  );
}
