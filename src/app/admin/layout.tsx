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
    <div className="flex flex-col min-h-screen bg-bg">
      <AdminNav />
      <main className="flex-1 pt-20 md:pt-8 pb-24 md:pb-12 px-4 sm:px-6 lg:px-10 md:ml-20 lg:ml-64 transition-all min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
