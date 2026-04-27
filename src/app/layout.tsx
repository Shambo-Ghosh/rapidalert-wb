import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { DemoInit } from "@/components/DemoInit";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RapidAlert WB",
  description: "Real-Time Crisis Response & Incident Management System for West Bengal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <DemoInit />
        <Navigation />
        <main className="md:pl-64 pb-16 md:pb-0 min-h-screen">
          {children}
        </main>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
