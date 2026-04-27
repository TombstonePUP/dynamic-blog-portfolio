import "@/app/globals.css";
import { isAdminProfile, requireApprovedContext } from "@/lib/admin-data.server";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import AdminHeader from "@/components/admin/header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await requireApprovedContext();
  const userName = profile?.display_name || user.email?.split("@")[0] || "Writer";
  const userEmail = user.email || "No email";
  const isAdmin = isAdminProfile(profile);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col bg-[#FAF9F6] min-h-screen">
        {/* Mobile Blocker */}
        <div className="flex md:hidden fixed inset-0 z-[9999] bg-[#FAF9F6] flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 border border-black/10 shadow-lg max-w-sm">
            <h1 className="text-xl font-bold mb-3">Desktop Required</h1>
            <p className="text-sm text-foreground/70">
              The admin dashboard is optimized for desktop screens. Please access this page from a larger device.
            </p>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden md:flex flex-col flex-1 w-full">
          <AdminHeader userName={userName} userEmail={userEmail} isAdmin={isAdmin} />
          {children}
        </div>
      </body>
    </html>
  );
}

