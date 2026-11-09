import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES, fromSlug, provOf, sameAsm, slug } from '@/lib/assemblies'
import Person from '@/components/Person'
import Congregants from '@/components/Congregants'
import EventMarquee from '@/components/EventMarquee'
import { since, upcoming } from '@/lib/dates'
import { FbButton } from '@/components/Facebook'
import { FACEBOOK } from '@/lib/social'
export const revalidate = 60
export const dynamicParams = false
export const generateStaticParams = () => Object.values(ASSEMBLIES).flat().map(a => ({ slug: slug(a) }))
export const generateMetadata = ({ params }) => ({ title: `${fromSlug(params.slug)} Assembly · Deliverance Ministries & The Way of God` })
const ORD = ['Bishop', 'Overseer', 'Secretary', 'Treasurer', 'Administrator', 'Advisor', 'Assembly Pastor']
const oi = r => (ORD.indexOf(r) < 0 ? 9 : ORD.indexOf(r))
export default async function Assembly({ params }) {
  const asm = fromSlug(params.slug)
  if (!asm) notFound()
  const prov = provOf(asm), today = new Date().toISOString().slice(0, 10)
  const [t, r, e, inf, ph] = await Promise.all([
    db.from('team').select('*').order('name'),
    db.from('reports').select('*').eq('prov', prov).order('date', { ascending: false }).limit(50),
    db.from('events').select('*').gte('date', since(today)).order('date'),
    db.from('assembly_info').select('*').eq('asm', asm).maybeSingle(),
    db.from('assembly_photos').select('*').eq('asm', asm).order('created_at'),
  ])
  const leaders = (t.data || []).filter(x => sameAsm(x.asm, asm)).sort((a, c) => oi(a.role) - oi(c.role))
  const reports = (r.data || []).filter(x => sameAsm(x.asm, asm)).slice(0, 6)
  const events = upcoming(e.data, today).filter(x => x.asms?.length ? x.asms.some(a => sameAsm(a, asm)) : !x.prov || x.prov === prov)
  const others = ASSEMBLIES[prov].filter(a => a !== asm)
  const info = inf.data || {}, photos = ph.data || []
  const pastor = leaders.find(x => x.role === 'Assembly Pastor')
  const map = info.map_link || (info.address && `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`)
  return (<>
    <header><Link href="/" className="brand" style={{ margin: 0 }}><img src="/logo.png" alt="logo" /><b>Deliverance Ministries & The Way of God</b></Link>
      <nav><Link href="/#assemblies">All assemblies</Link><a href="#location">Location</a><a href="#church">Our Church</a><a href="#sunday">A Normal Sunday</a><a href="#leaders">Leaders</a><a href="#congregants">Congregants</a><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook</a><Link href="/admin">Admin</Link></nav></header>
    <section className="hero small"><p>{prov}</p><h1>{asm}</h1><p>Assembly{pastor && ` · Pastor ${pastor.name}`}</p></section>
    <div className="wrap">
      <h2 id="location">Where we are</h2>
      {info.address || info.service_time ? <div className="card asm-loc">
        <div>{info.address && <p><b>📍 {info.address}</b></p>}{info.service_time && <p>⛪ {info.service_time}</p>}{pastor && <p>🙏 Pastor {pastor.name}</p>}
          {map && <a className="btn" href={map} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>}</div>
        {info.address && <iframe title={`Map of ${asm}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(info.address)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
      </div> : <p className="mu" style={{ textAlign: 'center' }}>Location coming soon.</p>}
      {[['church', 'Our Church'], ['sunday', 'A Normal Sunday']].map(([k, title]) => { const rows = photos.filter(p => p.kind === k)
        return <div key={k}><h2 id={k}>{title}</h2>{rows.length ? <div className="grid pics">{rows.map(x => <div className="card pic" key={x.id}>
          <a href={x.image_url} target="_blank" rel="noopener noreferrer" title="Open the full picture"><img src={x.image_url} alt={x.caption || `${title} at ${asm}`} loading="lazy" /></a>
          {x.caption && <div><p className="mu">{x.caption}</p></div>}</div>)}</div> : <p className="mu" style={{ textAlign: 'center' }}>Pictures coming soon.</p>}</div> })}
      <h2 id="leaders">Leaders</h2>
      {leaders.length ? <div className="grid people">{leaders.map(x => <Person key={x.id} x={x} />)}</div>
        : <p className="mu" style={{ textAlign: 'center' }}>No leaders listed for {asm} yet. Admins can add them under Team, with the assembly set to “{asm}”.</p>}
      <h2 id="congregants">Congregants</h2>
      <Congregants asm={asm} prov={prov} />
      <h2>Upcoming Events</h2>
      {events.length > 0 ? <EventMarquee events={events} showProv={false} /> : <p className="mu">No upcoming events.</p>}
      <h2>Recent Reports</h2>
      <div className="grid">{reports.map(x => <div className="card" key={x.id}><h3>{x.title || 'Service report'}</h3><div className="mu">{x.date}</div>
        <p><b>{x.count}</b> attended<br />Preacher: {x.preacher || '—'}</p>{x.word && <p><b>The word:</b> {x.word}</p>}</div>)}
        {!reports.length && <p className="mu">No reports yet.</p>}</div>
      {others.length > 0 && <><h2>Other {prov} assemblies</h2>
        <div className="chips">{others.map(a => <Link key={a} href={`/assembly/${slug(a)}`}>{a}</Link>)}</div></>}
    </div>
    <div className="band cta" style={{ marginTop: 72 }}><div style={{ fontSize: 'clamp(28px,7vw,44px)', fontWeight: 800 }}>STAY CONNECTED</div><p>Follow us on Facebook for services, events and news.</p><FbButton /></div>
    <footer style={{ marginTop: 0 }}><div><b>Deliverance Ministries & The Way of God Church Int</b></div><div><Link href="/">← Back to home</Link></div><div><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook: @wogchurchint</a></div><div>© 2026 D.M & W.O.G</div></footer>
  </>)
}
