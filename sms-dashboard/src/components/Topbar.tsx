"use client"

import ThemeToggle from "./ThemeToggle"
import { Download } from "lucide-react"

export default function Topbar() {
  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="font-semibold text-slate-800 dark:text-slate-100">SMS Profitability Tracker</div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export/daily-metrics"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200/60 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}


