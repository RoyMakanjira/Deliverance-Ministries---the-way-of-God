import { eventDates } from '@/lib/dates'
import { ASSEMBLIES } from '@/lib/assemblies'
const ALL = Object.values(ASSEMBLIES).flat().length
const asmList = a => a.length >= ALL ? 'All assemblies' : a.length > 5 ? `${a.slice(0, 4).join(', ')} +${a.length - 4} more` : a.join(', ')
// Event with an optional poster (image) or video above the details.
// Posters sit in a fixed portrait frame; the space around them is a blurred copy of the poster.
export default function EventCard({ x, showProv = true }) {
  return (
    <div className="card event">
      {x.media_url && (x.media_type === 'video'
        ? <video src={x.media_url} controls playsInline preload="metadata" />
        : <a className="event-poster" href={x.media_url} target="_blank" rel="noopener noreferrer" title="Open the full poster" style={{ '--poster': `url("${x.media_url}")` }}>
          <img src={x.media_url} alt={`${x.title} poster`} loading="lazy" /></a>)}
      <div className="event-body"><h3>{x.title}</h3>
        <div className="event-when">📅 {eventDates(x)}{x.time && ` · ${x.time}`}</div>
        <div className="mu">{[x.venue, showProv && x.prov].filter(Boolean).join(' · ')}</div>
        {x.asms?.length > 0 && <div className="mu" title={x.asms.join(', ')}>Assemblies: {asmList(x.asms)}</div>}</div>
    </div>
  )
}
