import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuthToken } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Admin Console – Shadi Sutra',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server‑side auth check via JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value ?? null;
  const payload = token ? verifyAuthToken(token) : null;

  // If not logged in or not an admin, redirect to login page
  if (!payload || payload.role !== 'admin') {
    redirect('/login');
  }

  return (
    <>
      <AdminNav />
      <main className="flex-1 pt-16 md:pt-6 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8 md:ml-20 lg:ml-64 transition-all min-h-[90dvh] bg-bg">
        {children}
      </main>
      <Footer />
    </>
  );
}
