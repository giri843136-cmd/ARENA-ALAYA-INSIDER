import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | Alaya Insider",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F0EA]">
      <div className="container py-12">
        <div className="flex items-center gap-2 text-xs text-[#8A8178] mb-8">
          <Link href="/" className="hover:text-[#C5AA8A] transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-[#6D655F]">Settings</span>
        </div>
        <div className="flex gap-12">
          <nav className="w-48 flex-shrink-0 space-y-1">
            <Link href="/settings/notifications" className="block px-4 py-2.5 text-sm rounded-lg bg-[#C5AA8A]/10 text-[#C5AA8A] font-medium">
              Notifications
            </Link>
            <span className="block px-4 py-2.5 text-sm rounded-lg text-[#6D655F] opacity-50 cursor-not-allowed">Profile</span>
            <span className="block px-4 py-2.5 text-sm rounded-lg text-[#6D655F] opacity-50 cursor-not-allowed">Account</span>
          </nav>
          <div className="flex-1 max-w-2xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
