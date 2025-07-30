import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Plus, BarChart3 } from 'lucide-react';

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <div className="min-h-screen flex bg-slate-50">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white shadow-lg">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-800">
                SMS Tracker
              </h1>
              <p className="text-sm text-slate-600 mt-1">Profitability Dashboard</p>
            </div>
            
            <div className="px-4 py-2">
              <Link 
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                href="/add"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors mt-1"
              >
                <Plus className="w-5 h-5" />
                <span>Add Data</span>
              </Link>
              
              <Link 
                href="/charts"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors mt-1"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Charts</span>
              </Link>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-xs text-slate-500 text-center">
                Built by Parker @ Worldwide Digital
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-8 bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 