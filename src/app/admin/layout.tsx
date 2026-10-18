import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin Console",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col">
      <AdminNav />

      {/* Main Content Area */}
      {/* Mobile (<768px): top margin for header, bottom padding for tab bar */}
      {/* Tablet (768-1023px): left margin md:ml-20 */}
      {/* Desktop (>=1024px): left margin lg:ml-64 */}
      <main className="flex-1 pt-16 md:pt-6 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8 md:ml-20 lg:ml-64 transition-all">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
