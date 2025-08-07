import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Plus, BarChart3 } from 'lucide-react';
import Topbar from "@/components/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMS Profitability Tracker",
  description: "Track SMS campaign performance and AdSense revenue",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        <div className="min-h-screen flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-r border-slate-200 dark:border-slate-800 hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">SMS Tracker</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Profitability Dashboard</p>
            </div>
            <div className="px-4 py-2 space-y-1">
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 rounded-lg transition-colors">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/add" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Data</span>
              </Link>
              <Link href="/charts" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Charts</span>
              </Link>
            </div>
            <div className="mt-auto p-6 text-xs text-slate-500 dark:text-slate-400">Built by Parker @ Worldwide Digital</div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950">
            <Topbar />
            <div className="max-w-7xl mx-auto p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
} 