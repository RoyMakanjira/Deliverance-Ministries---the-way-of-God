// Event dates are stored as 'YYYY-MM-DD'; read them as UTC so the day never shifts
const D = d => new Date(`${d}T00:00:00Z`)
export const fmtDate = d => d ? D(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''
export const eventDates = x => x.end_date && x.end_date !== x.date ? `From ${fmtDate(x.date)} to ${fmtDate(x.end_date)}` : fmtDate(x.date)
export const today = () => new Date().toISOString().slice(0, 10)
// events still on: not yet finished (last day today or later)
export const upcoming = (rows, t = today()) => (rows || []).filter(x => (x.end_date || x.date) >= t)
// start of the fetch window: multi-day events that started up to 90 days ago may still be running
export const since = (t = today()) => new Date(D(t) - 90 * 864e5).toISOString().slice(0, 10)
