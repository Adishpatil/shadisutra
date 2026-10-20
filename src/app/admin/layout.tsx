import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Admin Console – Shadi Sutra',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured() || !isAdminClientConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,access_enabled")
    .eq("id", user.id)
    .maybeSingle();
  if (
    profileError ||
    profile?.role !== "admin" ||
    !profile.access_enabled
  ) {
    redirect("/login");
  }

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError || assurance.currentLevel !== "aal2") redirect("/login");

  return (
    <div id="admin-shell" className="min-h-screen bg-bg">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <AdminNav />
      <main id="main-content" className="min-h-screen flex-1 px-4 pb-[calc(9rem+var(--safe-bottom))] pt-[calc(5rem+var(--safe-top))] sm:px-6 md:ml-60 md:px-8 md:pb-10 md:pt-20 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
