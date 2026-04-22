import "@/app/globals.css";
import GuestFooter from "@/components/guest/footer";
import GuestHeader from "@/components/guest/header";
import LenisProvider from "@/components/lenis-provider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body className="flex flex-col">
        <LenisProvider />
        <GuestHeader />
        {children}
        <GuestFooter />
      </body>
    </html>
  );
}
