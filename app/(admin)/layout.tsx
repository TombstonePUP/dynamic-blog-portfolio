import "@/app/globals.css";
import {
  isAdminProfile,
  requireApprovedContext,
} from "@/lib/admin-data.server";
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

import AdminHeader from "@/components/admin/header";

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
      <body className="flex min-h-screen flex-col bg-admin-bg font-sans text-admin-text selection:bg-admin-accent selection:text-admin-contrast">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Mobile Blocker */}
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-admin-bg p-6 text-center md:hidden">
          <div className="max-w-sm border border-admin-surface-hover bg-admin-surface p-8">
            <h1 className="mb-3 text-xl font-bold text-admin-heading">
              Desktop Required
            </h1>
            <p className="text-sm text-admin-muted">
              The admin dashboard is optimized for desktop screens. Please
              access this page from a larger device.
            </p>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden md:flex flex-col flex-1 w-full">
          <AdminHeader
            userName={userName}
            userEmail={userEmail}
            isAdmin={isAdmin}
          />
          {children}
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
