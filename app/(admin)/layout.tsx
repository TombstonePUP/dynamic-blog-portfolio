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
        {/* Main Content */}
        <div className="flex flex-col flex-1 w-full">
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
