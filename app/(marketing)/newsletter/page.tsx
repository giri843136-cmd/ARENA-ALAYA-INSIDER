"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="bg-[#F5F0EA]">
      <div className="container max-w-xl py-20 text-center">
        <div className="text-[#C5AA8A] text-xs tracking-[3px]">THE ALAYA LETTER</div>
        <h1 className="font-display text-[52px] tracking-[-2.4px] mt-3 mb-4 leading-none">A quiet letter, once a week.</h1>
        <p className="text-[#5C5249] max-w-md mx-auto">One beautiful object. One editorial essay. Three things we’re quietly obsessed with. Delivered Sunday morning.</p>

        {submitted ? (
          <div className="mt-10">
            <div className="text-[#C5AA8A] text-2xl font-display tracking-tight">Thank you. You are now part of the circle.</div>
            <p className="mt-2 text-[#8A8178]">Your first letter arrives this Sunday.</p>
          </div>
        ) : (
          <form className="mt-10 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="input flex-1 text-lg py-4" 
                required 
                aria-label="Email address for newsletter"
              />
              <Button type="submit" variant="primary" size="lg" disabled={loading} className="whitespace-nowrap">
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
            <p className="mt-4 text-xs text-[#8A8178]">We will never share your email. Unsubscribe anytime.</p>
          </form>
        )}
      </div>
    </div>
  );
}
