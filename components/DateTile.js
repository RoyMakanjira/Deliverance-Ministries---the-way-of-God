import { dateParts } from '@/lib/dates'
// Calendar tile showing the event's own month and day (the 📅 emoji always shows "17 July")
export default function DateTile({ date, end }) {
  const p = dateParts(date)
  if (!p) return null
  const e = end && end !== date ? dateParts(end) : null
  return (
    <div className="date-tile" aria-hidden="true">
      <span className="dt-mon">{p.mon}</span>
      <span className="dt-day">{p.day}{e && <small>–{e.day}</small>}</span>
      <span className="dt-wd">{p.wd}</span>
    </div>
  )
}
// Small line icons used beside the date and the time
export const CalIcon = () => <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
export const ClockIcon = () => <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
