// Force all admin pages to render dynamically at request time.
// This prevents Next.js from trying to statically prerender them during
// the Vercel build, where Supabase env vars are not available.
export const dynamic = "force-dynamic";

import "@/app/globals.css";
import { isAdminProfile, requireApprovedContext } from "@/services/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});
import AdminSidebar from "@/components/admin/sidebar";
import { CLIENT_CONFIG } from "@/config/client.config";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await requireApprovedContext();
  const userName =
    profile?.display_name || user.email?.split("@")[0] || "Writer";
  const userEmail = user.email || "No email";
  const isAdmin = isAdminProfile(profile);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen bg-admin-bg font-sans text-admin-text selection:bg-admin-accent selection:text-admin-contrast">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen w-full">
            <Suspense fallback={null}>
              <AdminSidebar
                siteName={CLIENT_CONFIG.site.name}
                userName={userName}
                userEmail={userEmail}
                isAdmin={isAdmin}
              />
            </Suspense>
            <div className="flex min-w-0 flex-1 flex-col bg-admin-surface">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
