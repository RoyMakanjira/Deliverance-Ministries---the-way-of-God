import Link from 'next/link'
import { supabase as db } from '@/lib/supabase'
import { fmtDate } from '@/lib/dates'
import DateTile from '@/components/DateTile'
import { FbButton } from '@/components/Facebook'
import { FACEBOOK } from '@/lib/social'
export const revalidate = 60
export const metadata = { title: 'Church Gallery · Deliverance Ministries & The Way of God' }
const Soon = () => <p className="mu" style={{ textAlign: 'center' }}>Coming soon.</p>
// dir -1: newest first; dir 1: soonest first. Undated rows go last, then newest added first.
const byDate = dir => (a, b) => {
  const fill = dir > 0 ? '9' : '0'
  return dir * (a.date || fill).localeCompare(b.date || fill) || b.created_at.localeCompare(a.created_at)
}
export default async function Gallery() {
  const { data } = await db.from('gallery').select('*')
  const rows = data || [], of = k => rows.filter(x => x.kind === k)
  const photos = of('photo').sort(byDate(-1)), goals = of('goal').sort(byDate(1)), wins = of('achievement').sort(byDate(-1))
  return (<>
    <header><Link href="/" className="brand" style={{ margin: 0 }}><img src="/logo.png" alt="logo" /><b>Deliverance Ministries & The Way of God</b></Link>
      <nav><Link href="/">Home</Link><a href="#pictures">Pictures</a><a href="#goals">Our Goals</a><a href="#achieved">What We Achieved</a><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook</a><Link href="/admin">Admin</Link></nav></header>
    <section className="hero small"><p>Deliverance Ministries &amp; The Way of God</p><h1>our church gallery</h1><p>Our pictures, the goals we are working towards, and what God has helped us achieve.</p></section>
    <div className="wrap">
      <h2 id="pictures">Pictures</h2>
      {photos.length ? <div className="gal">{photos.map(x => <a key={x.id} className="gal-item" href={x.image_url} target="_blank" rel="noopener noreferrer" title="Open the full picture">
        <img src={x.image_url} alt={x.title || 'Church picture'} loading="lazy" />
        {(x.title || x.date) && <span className="gal-cap">{x.title && <b>{x.title}</b>}{x.date && <small>{fmtDate(x.date)}</small>}</span>}</a>)}</div> : <Soon />}
      <h2 id="goals">Our Goals</h2>
      {goals.length ? <div className="grid">{goals.map((x, i) => <div key={x.id} className="card goal">
        {x.image_url && <img src={x.image_url} alt="" loading="lazy" />}
        <div className="goal-body"><span className="goal-no">{i + 1}</span><div><h3>{x.title}</h3>{x.date && <div className="goal-by">Target: {fmtDate(x.date)}</div>}{x.detail && <p className="mu">{x.detail}</p>}</div></div></div>)}</div> : <Soon />}
      <h2 id="achieved">What We Achieved</h2>
      {wins.length ? <div className="grid">{wins.map(x => <div key={x.id} className="card win">
        {x.image_url && <a href={x.image_url} target="_blank" rel="noopener noreferrer" title="Open the full picture"><img src={x.image_url} alt="" loading="lazy" /></a>}
        <div className="win-body"><div className="event-head">{x.date ? <DateTile date={x.date} /> : <span className="win-tick" aria-hidden="true">✓</span>}<h3>{x.title}</h3></div>{x.detail && <p className="mu">{x.detail}</p>}</div></div>)}</div> : <Soon />}
    </div>
    <div className="band cta" style={{ marginTop: 72 }}><div style={{ fontSize: 'clamp(28px,7vw,44px)', fontWeight: 800 }}>STAY CONNECTED</div><p>Follow us on Facebook for more pictures, services and news.</p><FbButton /></div>
    <footer style={{ marginTop: 0 }}><div><b>Deliverance Ministries & The Way of God Church Int</b></div><div><Link href="/">← Back to home</Link></div><div><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook: @wogchurchint</a></div><div>© 2026 D.M & W.O.G</div></footer>
  </>)
}
