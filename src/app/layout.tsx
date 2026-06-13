import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "SARATHI OS",
  description: "A private personal intelligence operating system for life mastery.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
              <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
            </main>
          </div>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
