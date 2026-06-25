"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, Key, Smartphone, MessageSquare, Users, Activity, AlertTriangle, Check, Copy, Eye, EyeOff, Loader2, RefreshCw, Ban, Plus, Phone } from "lucide-react";
import { toast } from "sonner";

interface StrengthResult { valid: boolean; message: string; }
interface TwoFAStatus { enabled: boolean; backupCodesRemaining: number; }
interface Sms2FAStatus { enabled: boolean; phoneNumber: string | null; verified: boolean; }
interface DelegatedRecord { id: string; email: string; role: string; active: boolean; expiresAt?: string; }
interface SecurityEvent { id: string; severity: string; createdAt: string; action: string; details?: string; }

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const checkStrength = (pw: string) => {
    if (pw.length < 8) return;
    const s = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/].filter((r) => r.test(pw)).length + (pw.length >= 12 ? 1 : 0);
    if (s < 3) setStrength({ valid: false, message: "Weak. Use uppercase, lowercase, numbers, and special characters." });
    else if (s < 4) setStrength({ valid: false, message: "Moderate. Add more variety." });
    else setStrength({ valid: true, message: "Strong ✓" });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 12) { toast.error("Must be at least 12 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/security/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const json = await res.json();
      if (json.success) { toast.success(json.data.message); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setStrength(null); }
      else { toast.error(json.error?.message || "Failed"); }
    } catch { toast.error("Network error"); } finally { setLoading(false); }
  };
  return (<div className="widget">
    <div className="flex items-center gap-2 mb-6"><Key size={16} className="text-[var(--admin-accent)]" /><div className="widget-title">CHANGE PASSWORD</div></div>
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div><label className="block text-xs text-[var(--admin-text-secondary)] mb-1.5">Current Password</label><input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-accent)]" placeholder="Current password" required /></div>
      <div><label className="block text-xs text-[var(--admin-text-secondary)] mb-1.5">New Password</label><input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setNewPassword(e.target.value); checkStrength(e.target.value); }} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" placeholder="At least 12 characters" required minLength={12} />{strength && <div className={`text-xs mt-1 ${strength.valid ? "text-[#4ADE80]" : "text-[#FBBF24]"}`}>{strength.message}</div>}</div>
      <div><label className="block text-xs text-[var(--admin-text-secondary)] mb-1.5">Confirm New Password</label><input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm" placeholder="Repeat new password" required /></div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword} className="btn-admin px-6 disabled:opacity-50">{loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}{loading ? "Changing..." : "Change Password"}</button>
        <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] flex items-center gap-1">{showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}{showPasswords ? "Hide" : "Show"}</button>
      </div>
    </form>
  </div>);
}

function TwoFactorSection() {
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState<string>("idle");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyToken, setVerifyToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const fetchStatus = async () => { setLoading(true); try { const res = await fetch("/api/v1/admin/security/setup-2fa"); const json = await res.json(); if (json.success) setStatus(json.data as TwoFAStatus); } catch {} finally { setLoading(false); } };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStatus(); }, []);
  const handleGenerate = async () => { setSetupMode("generating"); setSubmitting(true); try { const res = await fetch("/api/v1/admin/security/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate" }) }); const json = await res.json(); if (json.success) { setQrCode(json.data.qrCode); setBackupCodes(json.data.backupCodes as string[]); setSetupMode("verify"); } else { toast.error(json.error?.message); setSetupMode("idle"); } } catch { toast.error("Network error"); setSetupMode("idle"); } finally { setSubmitting(false); } };
  const handleVerify = async () => { if (!verifyToken) return; setSubmitting(true); try { const res = await fetch("/api/v1/admin/security/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", token: verifyToken }) }); const json = await res.json(); if (json.success) { toast.success(json.data.message); setSetupMode("complete"); setStatus(p => p ? { ...p, enabled: true } : { enabled: true, backupCodesRemaining: backupCodes.length }); } else { toast.error(json.error?.message); } } catch { toast.error("Network error"); } finally { setSubmitting(false); } };
  const handleDisable = async () => { if (!confirm("Disable authenticator 2FA?")) return; setSubmitting(true); try { const res = await fetch("/api/v1/admin/security/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "disable" }) }); const json = await res.json(); if (json.success) { toast.success(json.data.message); setStatus({ enabled: false, backupCodesRemaining: 0 }); setSetupMode("idle"); } } catch { toast.error("Network error"); } finally { setSubmitting(false); } };
  const handleRegenerate = async () => { setRegenerating(true); try { const res = await fetch("/api/v1/admin/security/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "regenerate-backup-codes" }) }); const json = await res.json(); if (json.success) { setBackupCodes(json.data.backupCodes as string[]); setSavedCodes(false); toast.success(json.data.message); } } catch { toast.error("Network error"); } finally { setRegenerating(false); } };
  const copyBackupCodes = () => { navigator.clipboard.writeText(backupCodes.join("\n")); toast.success("Copied!"); setSavedCodes(true); };
  if (loading) return <div className="widget"><div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><Loader2 size={14} className="animate-spin" /> Loading...</div></div>;
  return (<div className="widget">
    <div className="flex items-center gap-2 mb-6"><Smartphone size={16} className="text-[var(--admin-accent)]" /><div className="widget-title">AUTHENTICATOR APP (TOTP)</div>{status?.enabled && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20">ENABLED</span>}</div>
    <div className={`p-3 rounded-lg border text-sm mb-4 ${status?.enabled ? "bg-[#4ADE80]/5 border-[#4ADE80]/20" : "bg-[#FBBF24]/5 border-[#FBBF24]/20"}`}><div className="flex items-center gap-2">{status?.enabled ? <><Check size={14} className="text-[#4ADE80]" /><span className="text-[#4ADE80] text-xs">TOTP authenticator app is active</span></> : <><AlertTriangle size={14} className="text-[#FBBF24]" /><span className="text-[#FBBF24] text-xs">TOTP not enabled</span></>}</div></div>
    {!status?.enabled && setupMode === "idle" && <button onClick={handleGenerate} disabled={submitting} className="btn-admin">{submitting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Smartphone size={14} className="mr-2" />}Set up authenticator app</button>}
    {setupMode === "verify" && qrCode && (<div className="space-y-4">
      <div className="flex items-start gap-6">                    <div className="w-40 h-40 bg-white rounded-xl p-2 relative"><Image src={qrCode} alt="QR code for authenticator app" fill className="object-contain" unoptimized /></div><div className="text-sm space-y-2"><p className="text-[var(--admin-text-secondary)]">1. Open authenticator app</p><p className="text-[var(--admin-text-secondary)]">2. Scan QR code</p><p className="text-[var(--admin-text-secondary)]">3. Enter 6-digit code</p></div></div>
      <div className="flex items-center gap-3"><input type="text" value={verifyToken} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-32 px-3 py-2 text-center text-lg font-mono tracking-[8px] rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)]" /><button onClick={handleVerify} disabled={submitting || verifyToken.length !== 6} className="btn-admin disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Check size={14} className="mr-2" />}Verify</button></div>
      <div className="p-4 rounded-lg bg-[#FBBF24]/5 border border-[#FBBF24]/20"><div className="flex items-center justify-between mb-3"><div className="text-xs font-medium text-[#FBBF24]"><AlertTriangle size={12} /> BACKUP CODES</div><button onClick={copyBackupCodes} className="text-xs text-[var(--admin-accent)] hover:underline"><Copy size={12} /> {savedCodes ? "Copied!" : "Copy"}</button></div><div className="grid grid-cols-2 gap-2">{backupCodes.map((code, i) => <code key={i} className="text-xs font-mono bg-black/20 px-2 py-1 rounded select-all">{code}</code>)}</div></div>
    </div>)}
    {setupMode === "complete" && <div className="text-center py-4"><Check size={24} className="text-[#4ADE80] mx-auto mb-2" /><p className="text-sm text-[#4ADE80]">Authenticator 2FA is active!</p></div>}
    {status?.enabled && <div className="flex items-center gap-3 mt-2"><button onClick={handleDisable} disabled={submitting} className="text-xs text-[#F87171] hover:underline"><Ban size={12} /> Disable authenticator 2FA</button><button onClick={handleRegenerate} disabled={regenerating} className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"><RefreshCw size={12} className={regenerating ? "animate-spin" : ""} /> Regenerate backup codes</button></div>}
  </div>);
}

function SmsTwoFactorSection() {
  const [status, setStatus] = useState<Sms2FAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [setupMode, setSetupMode] = useState<string>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/security/sms-2fa");
      const json = await res.json();
      if (json.success) setStatus(json.data as Sms2FAStatus);
    } catch {} finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStatus(); }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRegisterPhone = async () => {
    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      toast.error("Use international format: +1234567890");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/security/sms-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-phone", phoneNumber }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || "Verification code sent");
        setSetupMode("verify");
        setSmsSent(true);
        setCooldown(60);
      } else {
        toast.error(json.error?.message || "Failed to register phone");
      }
    } catch { toast.error("Network error"); } finally { setSubmitting(false); }
  };

  const handleSendOtp = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/security/sms-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Code re-sent");
        setCooldown(60);
      } else {
        toast.error(json.error?.message || "Failed to send");
      }
    } catch { toast.error("Network error"); } finally { setSubmitting(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/security/sms-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", code: otpCode }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || "SMS 2FA enabled!");
        setSetupMode("complete");
        setStatus({ enabled: true, phoneNumber: phoneNumber || status?.phoneNumber || null, verified: true } as Sms2FAStatus);
      } else {
        toast.error(json.error?.message || "Invalid code");
        setOtpCode("");
      }
    } catch { toast.error("Network error"); } finally { setSubmitting(false); }
  };

  const handleDisable = async () => {
    if (!confirm("Disable SMS 2FA?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/security/sms-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.message || "SMS 2FA disabled");
        setStatus({ enabled: false, phoneNumber: status?.phoneNumber || null, verified: false } as Sms2FAStatus);
        setSetupMode("idle");
        setOtpCode("");
      }
    } catch { toast.error("Network error"); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="widget"><div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><Loader2 size={14} className="animate-spin" /> Loading...</div></div>;
  
  return (<div className="widget">
    <div className="flex items-center gap-2 mb-6"><MessageSquare size={16} className="text-[var(--admin-accent)]" /><div className="widget-title">SMS TWO-FACTOR AUTHENTICATION</div>{status?.enabled && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20">ENABLED</span>}</div>
    <div className={`p-3 rounded-lg border text-sm mb-4 ${status?.enabled ? "bg-[#4ADE80]/5 border-[#4ADE80]/20" : "bg-[#FBBF24]/5 border-[#FBBF24]/20"}`}>
      <div className="flex items-center gap-2">
        {status?.enabled ? (
          <><Check size={14} className="text-[#4ADE80]" /><span className="text-[#4ADE80] text-xs">SMS 2FA is active {status.phoneNumber ? `(${status.phoneNumber})` : ""}</span></>
        ) : (
          <><AlertTriangle size={14} className="text-[#FBBF24]" /><span className="text-[#FBBF24] text-xs">SMS 2FA not enabled</span></>
        )}
      </div>
    </div>
    
    {!status?.enabled && setupMode === "idle" && (
      <div className="space-y-3">
        <p className="text-xs text-[var(--admin-text-secondary)]">Register your mobile number to receive OTP codes via SMS.</p>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] text-sm font-mono focus:outline-none focus:border-[var(--admin-accent)]"
          />
          <button onClick={handleRegisterPhone} disabled={submitting || !phoneNumber} className="btn-admin disabled:opacity-50 whitespace-nowrap">
            {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Phone size={14} className="mr-1" />}
            Register & Send Code
          </button>
        </div>
      </div>
    )}
    
    {setupMode === "verify" && (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)]">
          <Phone size={16} className="text-[var(--admin-accent)] mt-0.5 flex-shrink-0" />
          <div className="text-xs text-[var(--admin-text-secondary)]">
            A verification code has been sent to <strong className="text-[var(--admin-text-primary)]">{phoneNumber || status?.phoneNumber}</strong>. Enter it below.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={otpCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-32 px-3 py-2 text-center text-lg font-mono tracking-[8px] rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)]"
          />
          <button onClick={handleVerifyOtp} disabled={submitting || otpCode.length !== 6} className="btn-admin disabled:opacity-50">
            {submitting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Check size={14} className="mr-2" />}
            Verify & Enable
          </button>
        </div>
        <button
          onClick={handleSendOtp}
          disabled={submitting || cooldown > 0}
          className="text-xs text-[var(--admin-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    )}
    
    {setupMode === "complete" && (
      <div className="text-center py-4">
        <Check size={24} className="text-[#4ADE80] mx-auto mb-2" />
        <p className="text-sm text-[#4ADE80]">SMS 2FA is active!</p>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">You'll receive OTP codes via SMS when signing in.</p>
      </div>
    )}
    
    {status?.enabled && (
      <button onClick={handleDisable} disabled={submitting} className="text-xs text-[#F87171] hover:underline mt-2">
        <Ban size={12} /> Disable SMS 2FA
      </button>
    )}
  </div>);
}

function DelegatedAccessSection() {
  const [records, setRecords] = useState<DelegatedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [submitting, setSubmitting] = useState(false);
  const fetchRecords = async () => { setLoading(true); try { const res = await fetch("/api/v1/admin/security/delegated-access"); const json = await res.json(); if (json.success) setRecords(json.data as DelegatedRecord[] || []); } catch {} finally { setLoading(false); } };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRecords(); }, []);
  const handleGrant = async (e: React.FormEvent) => { e.preventDefault(); setSubmitting(true); try { const res = await fetch("/api/v1/admin/security/delegated-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "grant", email, role }) }); const json = await res.json(); if (json.success) { toast.success("Access granted"); setEmail(""); setShowForm(false); fetchRecords(); } else { toast.error(json.error?.message); } } catch { toast.error("Network error"); } finally { setSubmitting(false); } };
  const handleRevoke = async (id: string, email: string) => { if (!confirm(`Revoke ${email}?`)) return; try { const res = await fetch("/api/v1/admin/security/delegated-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "revoke", accessId: id }) }); const json = await res.json(); if (json.success) { toast.success("Revoked"); fetchRecords(); } } catch { toast.error("Network error"); } };
  return (<div className="widget">
    <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2"><Users size={16} className="text-[var(--admin-accent)]" /><div className="widget-title">DELEGATED ACCESS</div></div><button onClick={() => setShowForm(!showForm)} className="btn-admin text-xs"><Plus size={14} className="mr-1" /> {showForm ? "Cancel" : "Grant"}</button></div>
    {showForm && <form onSubmit={handleGrant} className="mb-6 p-4 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)] space-y-3"><div><label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Email</label><input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="colleague@example.com" required className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] text-sm" /></div><div><label className="block text-xs text-[var(--admin-text-secondary)] mb-1">Role</label><select value={role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] text-sm"><option value="EDITOR">Editor</option><option value="SENIOR_EDITOR">Senior Editor</option><option value="ADMIN">Admin</option></select></div><button type="submit" disabled={submitting || !email} className="btn-admin disabled:opacity-50"><Users size={14} className="mr-2" />Grant</button></form>}
    {loading ? <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><Loader2 size={12} className="animate-spin" /> Loading...</div> : records.length === 0 ? <div className="text-xs text-[var(--admin-text-muted)]">No records.</div> : <div className="space-y-2">{records.map((r) => <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)]"><div><div className="text-sm">{r.email}</div><div className="text-xs text-[var(--admin-text-muted)]">{r.role} {r.active ? "• Active" : "• Revoked"}</div></div>{r.active && <button onClick={() => handleRevoke(r.id, r.email)} className="text-xs text-[#F87171] hover:underline"><Ban size={12} /> Revoke</button>}</div>)}</div>}
  </div>);
}

function ActivityLogSection() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("security-events");
  const fetchEvents = async () => { setLoading(true); try { const res = await fetch(`/api/v1/admin/security/activity?type=${filter}`); const json = await res.json(); if (json.success) setEvents(json.data as SecurityEvent[] || []); } catch {} finally { setLoading(false); } };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchEvents(); }, [filter]);
  const sevColor = (s: string) => { if (s === "critical") return "text-[#F87171]"; if (s === "warning") return "text-[#FBBF24]"; return "text-[#4ADE80]"; };
  return (<div className="widget">
    <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2"><Activity size={16} className="text-[var(--admin-accent)]" /><div className="widget-title">SECURITY ACTIVITY</div></div><div className="flex gap-2">{["security-events", "login-attempts", "active-sessions"].map((t) => <button key={t} onClick={() => setFilter(t)} className={`text-[10px] px-2 py-1 rounded-full border ${filter === t ? "bg-[var(--admin-accent)]/10 border-[var(--admin-accent)]/30 text-[var(--admin-accent)]" : "border-[var(--admin-border)] text-[var(--admin-text-muted)]"}`}>{t === "security-events" ? "Events" : t === "login-attempts" ? "Logins" : "Sessions"}</button>)}</div></div>
    {loading ? <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]"><Loader2 size={12} className="animate-spin" /> Loading...</div> : events.length === 0 ? <div className="text-xs text-[var(--admin-text-muted)]">No activity.</div> : <div className="space-y-1 max-h-80 overflow-y-auto">{events.map((e) => <div key={e.id} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--admin-bg-subtle)] text-xs"><div className={`w-1.5 h-1.5 shrink-0 rounded-full ${sevColor(e.severity)}`} /><div className="tabular-nums text-[var(--admin-text-muted)] w-16">{new Date(e.createdAt).toLocaleTimeString()}</div><div className="flex-1 text-[var(--admin-text-secondary)]">{e.action.replace(/_/g, " ")}</div>{e.details && <div className="text-[var(--admin-text-muted)] truncate max-w-[200px]" title={e.details}>{e.details}</div>}</div>)}</div>}
  </div>);
}

export default function SecurityCenterPage() {
  return (<div className="p-8 max-w-[1200px] mx-auto">
    <div className="mb-8"><div className="flex items-center gap-2 text-xs tracking-[2px] text-[var(--admin-accent)] font-medium"><Shield size={14} /> SECURITY CENTER</div><h1 className="text-3xl font-semibold tracking-tight mt-1">Security & Access</h1><p className="text-[var(--admin-text-secondary)] mt-1 text-sm">Manage authentication, SMS 2FA, authenticator app 2FA, delegated access, and monitoring.</p></div>
    <div className="space-y-6">
      <PasswordSection />
      <SmsTwoFactorSection />
      <TwoFactorSection />
      <DelegatedAccessSection />
      <ActivityLogSection />
    </div>
  </div>);
}
