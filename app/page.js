import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/Site'
import Hero from '@/components/Hero'
import LivePlayer from '@/components/LivePlayer'
import { getContent, getTeam, getAsmCards, getEvents, getReports, getGalleryPics, getTestimonies } from '@/lib/site'
import Testimony from '@/components/Testimony'
import { MINISTRIES } from '@/lib/content'
import { AboutBlock, MinistriesBlock, AssemblyStrip, EventsBlock, GalleryTeaser, More } from '@/components/Blocks'
import TeamMarquee from '@/components/TeamMarquee'
export const revalidate = 60
// Homepage: a taste of every page; the menu buttons open the full pages
export default async function Home() {
  const [content, team, events, reports, galPics, tes] = await Promise.all([getContent(), getTeam(), getEvents(), getReports(1), getGalleryPics(), getTestimonies()])
  const cards = await getAsmCards(team.pastors)
  const { raw, sections, get } = content
  const liveRow = raw.find(x => x.key === 'live' && x.body), live = liveRow && { title: liveRow.title || 'Live service', url: liveRow.body }
  const pics = (raw.find(x => x.key === 'hero')?.body || '').split('\n').filter(Boolean)
  return (<>
    <SiteHeader active="home" />
    <Hero hasReports={reports.length > 0} pics={pics} />
    {live && <div className="wrap" id="live" style={{ paddingTop: 32 }}><LivePlayer live={live} /></div>}
    <div className="band"><blockquote>The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives, and recovering of sight to the blind, to set at liberty them that are bruised.<cite style={{ display: 'block', fontSize: 13, marginTop: 12 }}>Luke 4:18</cite></blockquote></div>
    <div className="wrap">
      <h2 id="about">{get('about').title}</h2>
      <AboutBlock about={get('about')} />
      <h2>Our Ministries</h2>
      <MinistriesBlock ministries={sections.filter(s => MINISTRIES.includes(s.key))} />
      <h2>Our Assemblies</h2>
      <AssemblyStrip cards={cards} />
      <More href="/assemblies">Find an assembly</More>
      <h2>Upcoming Events</h2>
      <EventsBlock events={events} />
      <More href="/events">All events</More>
      <h2>Our Church Gallery</h2>
      <GalleryTeaser pics={galPics} />
      <h2>National Executive Board</h2>
      {team.heads.length > 0 ? <TeamMarquee people={team.heads} /> : <p className="mu" style={{ textAlign: 'center' }}>Coming soon.</p>}
      <More href="/leaders">Meet all our leaders</More>
      <h2>Testimonies</h2>
      {tes.length > 0 ? <div className="tes-grid">{tes.map(x => <Testimony key={x.id} x={x} short />)}</div>
        : <p className="mu" style={{ textAlign: 'center' }}>Has God done something in your life? Share it to encourage others.</p>}
      <More href="/testimonies">{tes.length ? 'Read more testimonies' : 'Share your testimony'}</More>
      <h2>Get Involved</h2>
      <div className="grid involve">
        <Link className="card" href="/give"><h3>Give</h3><p className="mu">Tithes, donations and pledges to the Bishop’s Wallet or any assembly.</p><span className="more">Give now →</span></Link>
        <Link className="card" href="/partners"><h3>Partner with Evangelism</h3><p className="mu">Support the evangelism team so the gospel reaches every part of the world.</p><span className="more">Become a partner →</span></Link>
        <Link className="card" href="/register"><h3>Join Us</h3><p className="mu">New here? Register and the church admin will welcome you.</p><span className="more">Register →</span></Link>
      </div>
    </div>
    <SiteFooter />
  </>)
}
