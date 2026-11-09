import Person from '@/components/Person'
import { fmtDate } from '@/lib/dates'
import DateTile, { CalIcon } from '@/components/DateTile'
import EventMarquee from '@/components/EventMarquee'
// Picture cards on a ministry page; a recent event with several pictures is one card per picture
const Cards = ({ rows, tall }) => <div className="grid pics">{rows.map(x => <div className="card pic" key={x.id}>
  {x.image_url && <a className={tall ? 'tall' : ''} href={x.image_url} target="_blank" rel="noopener noreferrer" title="Open the full picture"><img src={x.image_url} alt={x.title} loading="lazy" /></a>}
  <div><div className="event-head"><DateTile date={x.date} /><h3>{x.title}</h3></div>{x.date && <div className="event-when"><span><CalIcon />{fmtDate(x.date)}</span></div>}{x.detail && <p className="mu">{x.detail}</p>}</div></div>)}</div>
const Soon = () => <p className="mu" style={{ textAlign: 'center' }}>Coming soon.</p>
// events: church events tagged with this ministry; a hand-added upcoming card with the same title is not repeated
export default function MinistryItems({ items, events = [], today }) {
  const same = t => (t || '').trim().toLowerCase()
  const of = k => items.filter(x => x.kind === k)
  const recent = of('recent').sort((a, c) => (c.date || '').localeCompare(a.date || ''))
  const upcoming = of('upcoming').filter(x => (!x.date || x.date >= today) && !events.some(e => same(e.title) === same(x.title))).sort((a, c) => (a.date || '9').localeCompare(c.date || '9'))
  const leaders = of('leader'), programs = of('program')
  return (<>
    <h2 id="recent">Recent Events</h2>{recent.length ? <Cards rows={recent} /> : <Soon />}
    <h2 id="upcoming">Upcoming Events</h2>{events.length > 0 && <EventMarquee events={events} showProv />}{upcoming.length > 0 && <Cards rows={upcoming} tall />}{!events.length && !upcoming.length && <Soon />}
    <h2 id="leadership">Leadership</h2>{leaders.length ? <div className="grid pics">{leaders.map(x => <Person key={x.id} x={{ name: x.title, role: x.detail, photo_url: x.image_url }} />)}</div> : <Soon />}
    <h2 id="programs">Programs</h2>{programs.length ? <Cards rows={programs} /> : <Soon />}
  </>)
}
