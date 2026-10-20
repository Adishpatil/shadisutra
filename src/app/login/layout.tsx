import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Admin Sign In | ${site.name}`,
  description: `Secure administrator sign-in for ${site.name}.`,
  robots: { index: false, follow: false, noarchive: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
