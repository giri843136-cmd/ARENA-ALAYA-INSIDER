import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./admin-globals.css";
import { AdminSidebar } from "@/components/admin/layouts/AdminSidebar";
import { AdminTopBar } from "@/components/admin/layouts/AdminTopBar";
import { AdminCommandPaletteProvider } from "@/components/admin/ui/AdminCommandPaletteProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ALAYA Admin",
  description: "Internal command center for ALAYA INSIDER",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark admin-theme`}>
      <body className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans antialiased selection:bg-[#C5A26F] selection:text-[#0A0A0A]">
        <AdminCommandPaletteProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1F1F1F', border: '1px solid #333', color: '#EDEDED' },
              duration: 4000,
            }}
          />
          <div className="flex h-screen overflow-hidden">
            {/* Collapsible Sidebar */}
            <AdminSidebar />

            {/* Main Workspace */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <AdminTopBar />

              <div className="flex-1 overflow-auto">
                <div className="h-full">
                  {children}
                </div>
              </div>
            </div>
          </div>

        </AdminCommandPaletteProvider>
      </body>
    </html>
  );
}
