import "@/app/globals.css";
import { Hanken_Grotesk } from "next/font/google";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body className="min-h-screen bg-[#f6f3ea] text-foreground">{children}</body>
    </html>
  );
}
