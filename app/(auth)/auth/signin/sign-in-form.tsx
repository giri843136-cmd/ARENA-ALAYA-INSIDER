"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertTriangle, Check, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("/admin");

  // Only read search params on client to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get("callbackUrl");
      if (cb) setCallbackUrl(cb);

      const authError = params.get("error");
      if (authError === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else if (authError === "OAuthSignin") {
        setError("Could not sign in with Google. Please try again.");
      }
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const totpRef = useRef<HTMLInputElement>(null);

  // Focus the TOTP input when 2FA is triggered
  useEffect(() => {
    if (requires2FA && totpRef.current) {
      totpRef.current.focus();
    }
  }, [requires2FA]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        totpToken: useBackupCode ? "" : totpToken,
        backupCode: useBackupCode ? backupCode : "",
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        const errMsg = result?.error || "";
        if (errMsg === "requires_2fa") {
          setRequires2FA(true);
          setError(null);
        } else if (errMsg === "2fa_failed" || errMsg.includes("2fa")) {
          setError("Invalid authentication code. Please try again.");
          setTotpToken("");
          setBackupCode("");
        } else {
          setError(errMsg || "Invalid email or password");
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "";
      if (errMsg === "requires_2fa") {
        setRequires2FA(true);
        setError(null);
      } else {
        setError(errMsg || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        setSuccessEmail(email);
      } else {
        setError(result?.error || "Failed to send magic link");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  // Magic link sent state
  if (successEmail) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4DDD5] p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-[#4ADE80]" />
          </div>
          <h1 className="text-xl font-semibold text-[#2C2522] mb-2">Check your email</h1>
          <p className="text-sm text-[#6D655F] mb-6">
            We sent a magic link to <strong className="text-[#2C2522]">{successEmail}</strong>. Click it to sign in instantly.
          </p>
          <button
            onClick={() => setSuccessEmail(null)}
            className="text-sm text-[#C5AA8A] hover:text-[#B89B7A] transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[#C5AA8A] flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-tight">A</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#2C2522]">ALAYA</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#2C2522]">
            {requires2FA ? "Two-factor authentication" : "Welcome back"}
          </h1>
          <p className="text-sm text-[#6D655F] mt-1">
            {requires2FA
              ? "Enter the verification code from your authenticator app"
              : "Sign in to the ALAYA INSIDER admin panel"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E4DDD5] p-8 shadow-sm">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F87171]/10 text-[#F87171] text-sm mb-6 border border-[#F87171]/20">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {requires2FA ? (
            /* 2FA Verification Form */
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F5F0EA] text-sm text-[#5C5249] border border-[#E4DDD5]">
                <ShieldAlert size={18} className="text-[#C5AA8A] flex-shrink-0" />
                <span>
                  Signed in as <strong className="text-[#2C2522]">{email}</strong>. Please enter your authentication code.
                </span>
              </div>

              {!useBackupCode ? (
                <div>
                  <label htmlFor="totpToken" className="block text-sm font-medium text-[#2C2522] mb-1.5">
                    Authenticator code
                  </label>
                  <input
                    ref={totpRef}
                    id="totpToken"
                    type="text"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000 000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[8px] rounded-xl border border-[#E4DDD5] bg-white text-[#2C2522] placeholder:text-[#C5AA8A]/40 focus:outline-none focus:ring-2 focus:ring-[#C5AA8A]/30 focus:border-[#C5AA8A] transition-all"
                  />
                  <p className="text-xs text-[#8A8178] mt-1.5 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="backupCode" className="block text-sm font-medium text-[#2C2522] mb-1.5">
                    Backup code
                  </label>
                  <input
                    id="backupCode"
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="Enter a backup recovery code"
                    autoComplete="off"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4DDD5] bg-white text-sm text-[#2C2522] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#C5AA8A]/30 focus:border-[#C5AA8A] transition-all font-mono tracking-wider"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!totpToken && !backupCode)}
                className="w-full py-2.5 bg-[#C5AA8A] text-white text-sm font-medium rounded-xl hover:bg-[#B89B7A] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                {loading ? "Verifying..." : "Verify code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTotpToken("");
                  setBackupCode("");
                }}
                className="w-full text-xs text-[#C5AA8A] hover:text-[#B89B7A] transition-colors"
              >
                {useBackupCode ? "Use authenticator code instead" : "Use a backup code instead"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTotpToken("");
                  setBackupCode("");
                  setUseBackupCode(false);
                }}
                className="w-full text-xs text-[#8A8178] hover:text-[#5C5249] transition-colors"
              >
                &larr; Back to sign in
              </button>
            </form>
          ) : (
            <>
              {/* Password Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#2C2522] mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4DDD5] bg-white text-sm text-[#2C2522] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#C5AA8A]/30 focus:border-[#C5AA8A] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#2C2522] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#E4DDD5] bg-white text-sm text-[#2C2522] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#C5AA8A]/30 focus:border-[#C5AA8A] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8178] hover:text-[#2C2522] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-2.5 bg-[#C5AA8A] text-white text-sm font-medium rounded-xl hover:bg-[#B89B7A] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E4DDD5]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[#8A8178]">Or continue with</span>
                  </div>
                </div>
              </div>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-[#E4DDD5] text-sm font-medium text-[#2C2522] hover:bg-[#FAF7F4] transition-colors mb-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              {/* Magic Link */}
              <form onSubmit={handleMagicLink}>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E4DDD5] text-sm font-medium text-[#2C2522] hover:bg-[#FAF7F4] transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {loading ? "Sending..." : `Send magic link to ${email || "your email"}`}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {!requires2FA && (
          <p className="text-center text-xs text-[#8A8178] mt-6">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[#C5AA8A] hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[#C5AA8A] hover:underline">Privacy Policy</Link>
          </p>
        )}
      </div>
    </div>
  );
}
