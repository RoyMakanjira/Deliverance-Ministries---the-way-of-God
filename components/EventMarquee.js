'use client'
import { useEffect, useState } from 'react'
import EventCard from '@/components/EventCard'
import { today, upcoming } from '@/lib/dates'
// Slowly scrolling strip of events, the same movement as TeamMarquee (moves right, loops seamlessly, pauses on hover).
// Events that are over are dropped on the visitor's device too, because a saved copy of the page may be days old.
export default function EventMarquee({ events: all, showProv }) {
  const [now, setNow] = useState(null)
  useEffect(() => setNow(today()), [])
  const events = now ? upcoming(all, now) : all
  if (!events.length) return <p className="mu">No upcoming events.</p>
  let set = events
  while (set.length < 4) set = [...set, ...events]
  return (
    <div className="marquee events">
      <div className="marquee-track" style={{ animationDuration: `${set.length * 8}s` }}>
        {[...set, ...set].map((x, i) => <div key={i} aria-hidden={i >= events.length || undefined}><EventCard x={x} showProv={showProv} copy={i >= events.length} /></div>)}
      </div>
    </div>
  )
}
