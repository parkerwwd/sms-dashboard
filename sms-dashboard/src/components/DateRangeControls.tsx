"use client"

import DateRangePicker from "./DateRangePicker"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Download } from "lucide-react"

export default function DateRangeControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialStart = searchParams.get('start') || ''
  const initialEnd = searchParams.get('end') || ''
  const [start, setStart] = useState<string | null>(initialStart || null)
  const [end, setEnd] = useState<string | null>(initialEnd || null)

  useEffect(() => {
    // Sync when URL changes externally
    setStart(initialStart || null)
    setEnd(initialEnd || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStart, initialEnd])

  const exportHref = useMemo(() => {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    return `/api/export/daily-metrics${params.toString() ? `?${params.toString()}` : ''}`
  }, [start, end])

  const onChange = (nextStart: string, nextEnd: string) => {
    setStart(nextStart)
    setEnd(nextEnd)
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('start', nextStart)
    params.set('end', nextEnd)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <DateRangePicker onChange={onChange} initialDays={30} />
      <a
        href={exportHref}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200/60 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">Export CSV</span>
      </a>
    </div>
  )
}


