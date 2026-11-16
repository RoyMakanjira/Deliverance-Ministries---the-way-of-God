'use client'
import { useEffect, useState } from 'react'
import { today } from '@/lib/dates'
// Hides its contents once the date (YYYY-MM-DD) has passed, even on a saved copy of the page
export default function HideIfPast({ date, children }) {
  const [over, setOver] = useState(false)
  useEffect(() => setOver(!!date && date < today()), [date])
  return over ? null : children
}
