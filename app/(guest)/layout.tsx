import "@/app/globals.css";
import GuestFooter from "@/components/guest/footer";
import GuestHeader from "@/components/guest/header";
import LenisProvider from "@/components/lenis-provider";
import ScrollToTop from "@/components/scroll-to-top";
import { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";

import { getBlogs } from "@/lib/blogs.server";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "The Strengths Writer",
  description:
    "Positive psychology and personal development newsletter focused on helping readers identify and leverage their unique strengths to achieve their goals and live fulfilling lives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const blogs = getBlogs();

  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body className="flex flex-col">
        <LenisProvider />
        <GuestHeader blogs={blogs} />
        {children}
        <GuestFooter />
        <ScrollToTop />
      </body>
    </html>
  );
}

