import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuthToken } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

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
