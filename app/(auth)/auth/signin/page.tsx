import { Suspense } from "react";
import SignInForm from "./sign-in-form";

// Server component wrapper with Suspense boundary for useSearchParams()
// This prevents React hydration error #418 (text content mismatch)
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4DDD5] p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-[#E4DDD5] rounded mx-auto" />
            <div className="h-4 w-64 bg-[#E4DDD5] rounded mx-auto" />
            <div className="h-10 w-full bg-[#E4DDD5] rounded-xl" />
            <div className="h-10 w-full bg-[#E4DDD5] rounded-xl" />
            <div className="h-10 w-full bg-[#C5AA8A]/50 rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
