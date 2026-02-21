import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BetPlay - Premium Betting Experience",
  description: "A modern, fast, and secure betting platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-neutral-950 text-neutral-50 antialiased`}
      >
        {children}
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
