import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getEvents } from '@/lib/site'
import EventCard from '@/components/EventCard'
import HideIfPast from '@/components/HideIfPast'
export const revalidate = 60
export const metadata = { title: 'Upcoming Events · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const events = await getEvents()
  return (<>
    <SiteHeader active="events" />
    <PageHero title="Upcoming Events">Services, revivals and gatherings across our assemblies.</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      {events.length ? <div className="grid events-grid">{events.map(x => <HideIfPast key={x.id} date={x.end_date || x.date}><EventCard x={x} /></HideIfPast>)}</div>
        : <p className="mu" style={{ textAlign: 'center' }}>No upcoming events right now. Follow us on Facebook to hear about the next one.</p>}
    </div>
    <SiteFooter />
  </>)
}
