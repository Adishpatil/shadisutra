import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuthToken } from '@/lib/auth';
import { PortalNav } from '@/components/portal/PortalNav';

export const metadata: Metadata = {
  title: 'My Event Portal – Shadi Sutra',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server‑side auth check: customer or admin
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value ?? null;
  const payload = token ? verifyAuthToken(token) : null;

  if (!payload) {
    redirect('/login');
  }

  // Both admin and customer can view the portal
  // (admin may want to preview what the customer sees)

  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col">
      <PortalNav userRole={payload.role} />
      <main className="flex-1 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
