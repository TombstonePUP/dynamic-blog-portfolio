import "@/app/globals.css";
import GuestHeader from "@/components/guest/header";
import LenisProvider from "@/components/lenis-provider";
import ScrollToTop from "@/components/scroll-to-top";
import AdminGuestViewToggle from "@/features/posts/components/guest/admin-guest-view-toggle";
import { getBlogs, getGuestViewState } from "@/services/posts";
import { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "The Strengths Writer",
  description:
    "Positive psychology and personal development newsletter focused on helping readers identify and leverage their unique strengths to achieve their goals and live fulfilling lives.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [blogs, guestViewState] = await Promise.all([
    getBlogs(),
    getGuestViewState(),
  ]);

  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body className="flex flex-col bg-background text-foreground">
        <LenisProvider />
        <GuestHeader blogs={blogs} />
        {children}
        {guestViewState.isAdmin ? (
          <AdminGuestViewToggle
            isViewingAsGuest={guestViewState.isViewingAsGuest}
          />
        ) : null}
        <ScrollToTop />
      </body>
    </html>
  );
}
