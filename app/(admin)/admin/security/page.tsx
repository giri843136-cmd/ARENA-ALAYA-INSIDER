"use client";

export default function SecurityCenter() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="text-xs tracking-[2.5px] text-[#C5AA8A]">SECURITY &amp; ACCESS</div>
        <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">Security Center</h1>
      </div>

      <div className="space-y-5 md:space-y-6">
        <div className="admin-card p-8">
          <div className="font-medium tracking-tight mb-2">Role-Based Access Control</div>
          <div className="text-sm text-[#A1A1A1]">5 roles • 47 users • 12 active sessions</div>
          <button className="btn-admin mt-5 text-xs">Manage Roles &amp; Permissions</button>
        </div>

        <div className="admin-card p-8">
          <div className="font-medium tracking-tight mb-4">Recent Security Events</div>
          <div className="text-sm space-y-3 text-[#A1A1A1]">
            <div>• 3 failed login attempts from 185.22.x.x — blocked</div>
            <div>• API key “marketing-bot” rotated (Elena Voss)</div>
            <div>• 2FA enabled for all admin users</div>
          </div>
        </div>

        <div className="text-xs text-[#666]">Full audit logs and suspicious activity detection available in Activity Timeline. All auth hardening from prior phases preserved.</div>
      </div>
    </div>
  );
}
