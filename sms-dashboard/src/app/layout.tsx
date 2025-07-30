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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen`}
      >
        <div className="min-h-screen flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white/80 backdrop-blur-sm shadow-xl border-r border-slate-200/50">
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SMS Profitability Tracker
              </h1>
              <p className="text-sm text-slate-600 mt-1">Profitability Dashboard</p>
            </div>
            
            <div className="px-4 py-6 space-y-2">
              <Link 
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link 
                href="/add"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all duration-200 group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add Data</span>
              </Link>
              
              <Link 
                href="/charts"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200 group"
              >
                <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Charts</span>
              </Link>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-xs text-slate-500 text-center p-3 bg-slate-50/50 rounded-lg">
                Built by Parker @ Worldwide Digital
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
} 