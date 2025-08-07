"use client"

import { useEffect, useState } from "react"
import { subDays, format } from "date-fns"

type Props = {
  initialDays?: number
  onChange?: (start: string, end: string) => void
}

export default function DateRangePicker({ initialDays = 30, onChange }: Props) {
  const [start, setStart] = useState<string>(format(subDays(new Date(), initialDays), 'yyyy-MM-dd'))
  const [end, setEnd] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    onChange?.(start, end)
  }, [start, end, onChange])

  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
      />
      <span className="text-slate-500">to</span>
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
      />
    </div>
  )
}


