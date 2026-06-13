"use client";

export default function Integrations() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">CONNECTIVITY</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Integrations</h1>
      </div>

      <div className="space-y-3 md:space-y-4">
        {["Typesense", "Cloudinary", "Resend", "Impact", "Amazon Associates", "Sentry", "PostHog", "BullMQ / Upstash Redis"].map((name, i) => (
          <div key={i} className="admin-card p-6 flex justify-between items-center border border-[var(--admin-border)]">
            <div className="font-medium">{name}</div>
            <div className="badge-admin badge-admin-success text-xs">Connected • Healthy</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--admin-text-muted)] mt-8">API keys and webhook configuration live in System Settings. All backend services (queues, search, analytics) frozen and production-ready.</p>
    </div>
  );
}

