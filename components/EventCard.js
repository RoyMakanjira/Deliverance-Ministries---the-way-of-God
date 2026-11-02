import { eventDates } from '@/lib/dates'
// Event with an optional poster (image) or video above the details
export default function EventCard({ x, showProv = true }) {
  return (
    <div className="card event">
      {x.media_url && (x.media_type === 'video'
        ? <video src={x.media_url} controls playsInline preload="metadata" />
        : <a href={x.media_url} target="_blank" rel="noopener noreferrer" title="Open the full poster"><img src={x.media_url} alt={`${x.title} poster`} loading="lazy" /></a>)}
      <div className="event-body"><h3>{x.title}</h3>
        <div className="event-when">📅 {eventDates(x)}{x.time && ` · ${x.time}`}</div>
        <div className="mu">{[x.venue, showProv && x.prov].filter(Boolean).join(' · ')}</div>
        {x.asms?.length > 0 && <div className="mu">Assemblies: {x.asms.join(', ')}</div>}</div>
    </div>
  )
}
