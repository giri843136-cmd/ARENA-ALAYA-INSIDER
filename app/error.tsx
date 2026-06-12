"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Intentionally log the error for observability (production error boundary)
    console.error(error);
  }, [error]);

  return (
    <div className="bg-[#F5F0EA] min-h-[70vh] flex items-center">
      <div className="container text-center">
        <div className="font-display text-5xl tracking-tight mb-4">Something went quietly wrong.</div>
        <p className="text-[#6D655F] max-w-sm mx-auto">We’re sorry. A small team of editors is already looking into it.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button onClick={() => reset()} variant="primary">Try again</Button>
          <Link href="/" className="btn btn-secondary">Go home</Link>
        </div>
      </div>
    </div>
  );
}
