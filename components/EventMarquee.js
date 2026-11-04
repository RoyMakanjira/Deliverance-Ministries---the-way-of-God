import EventCard from '@/components/EventCard'
// Slowly scrolling strip of events, the same movement as TeamMarquee (moves right, loops seamlessly, pauses on hover).
export default function EventMarquee({ events, showProv }) {
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
