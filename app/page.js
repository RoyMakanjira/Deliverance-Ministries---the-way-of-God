import { supabase as db } from '@/lib/supabase'
import Register from '@/components/Register'
import Person from '@/components/Person'
import Link from 'next/link'
import { ASSEMBLIES, slug } from '@/lib/assemblies'
export const revalidate = 60
const ORD = ['Bishop', 'Overseer', 'Secretary', 'Treasurer', 'Administrator']
const oi = r => (ORD.indexOf(r) < 0 ? 9 : ORD.indexOf(r))
export default async function Home() {
  const today = new Date().toISOString().slice(0, 10)
  const [r, e, t] = await Promise.all([
    db.from('reports').select('*').order('date', { ascending: false }).limit(12),
    db.from('events').select('*').gte('date', today).order('date'),
    db.from('team').select('*').order('name'),
  ])
  const reports = r.data || [], events = e.data || [], team = t.data || []
  const b = reports.filter(x => x.women != null)
  const sum = k => b.reduce((a, x) => a + (x[k] || 0), 0)
  const top = team.filter(x => x.role !== 'Assembly Pastor').sort((a, c) => oi(a.role) - oi(c.role))
  const pastors = team.filter(x => x.role === 'Assembly Pastor')
  return (<>
    <header><div className="brand"><img src="/logo.png" alt="logo" /><b>Deliverance Ministries & The Way of God</b></div>
      <nav><a href="#assemblies">Assemblies</a><a href="#reports">Reports</a><a href="#events">Events</a><a href="#team">Team</a><a href="#register">Register</a><a href="/admin">Admin</a></nav></header>
    <section className="hero"><img src="/logo.png" alt="" width="130" style={{ background: '#fff', borderRadius: '50%' }} />
      <p>Welcome to</p><h1>Deliverance Ministries<br />& The Way of <span style={{ textTransform: 'none' }}>God</span></h1><p>Church International</p>
      <div><a className="btn w" href="#register">Join Us</a><a className="btn w" href="#reports">Latest Reports</a></div></section>
    <div className="band"><blockquote>I am the way, the truth, and the life: no man cometh unto the Father, but by me.<cite style={{ display: 'block', fontSize: 13, marginTop: 12 }}>John 14:6</cite></blockquote></div>
    <div className="wrap">
      <h2 id="assemblies">Our Assemblies</h2>
      <div className="grid">{Object.entries(ASSEMBLIES).map(([p, a]) => <div className="card" key={p} style={{ borderTop: '5px solid var(--blue)' }}><h3>{p}</h3>
        <div className="mu">{a.length} {a.length === 1 ? 'assembly' : 'assemblies'}</div><div className="chips" style={{ justifyContent: 'flex-start', marginTop: 10 }}>{a.map(x => <Link key={x} href={`/assembly/${slug(x)}`}>{x}</Link>)}</div></div>)}</div>
      <h2 id="reports">Latest Reports</h2>
      {b.length > 0 && <div className="grid stats" style={{ marginBottom: 16 }}>{[['Total present', reports.reduce((a, x) => a + x.count, 0)], ['Women', sum('women')], ['Men', sum('men')], ['Youth', sum('youth')], ['Sunday School', sum('sunday')]].map(([l, n]) => <div className="stat" key={l}><b>{n}</b>{l}</div>)}</div>}
      <div className="grid">{reports.map(x => <div className="card" key={x.id}><h3>{x.title || 'Service report'}</h3>
        <div className="mu">{x.prov}{x.asm && ` · ${x.asm}`} · {x.date}</div><p><b>{x.count}</b> attended{x.women != null && ` (W ${x.women}, M ${x.men}, Youth ${x.youth}, SS ${x.sunday})`}<br />Preacher: {x.preacher || '—'}</p>{x.word && <p><b>The word:</b> {x.word}</p>}</div>)}
        {!reports.length && <p className="mu">No reports yet.</p>}</div>
      <h2 id="events">Upcoming Events</h2>
      <div className="grid">{events.map(x => <div className="card" key={x.id} style={{ borderTop: '5px solid var(--red)' }}><h3>{x.title}</h3><div className="mu">{x.date} {x.time} {x.venue && `· ${x.venue}`} {x.prov && `· ${x.prov}`}</div>{x.asms?.length > 0 && <div className="mu">Assemblies: {x.asms.join(', ')}</div>}</div>)}
        {!events.length && <p className="mu">No upcoming events.</p>}</div>
      <h2 id="team">Meet the Team</h2>
      {top.length > 0 && <div className="grid people">{top.map(x => <Person key={x.id} x={x} />)}</div>}
      {pastors.length > 0 && <><h3 style={{ margin: '28px 0 12px' }}>Assembly Pastors</h3><div className="grid people">{pastors.map(x => <Person key={x.id} x={x} />)}</div></>}
      <h2 id="register">Join us / Register</h2><Register />
    </div>
    <div className="band cta" style={{ marginTop: 72 }}><div style={{ fontSize: 'clamp(34px,10vw,56px)', fontWeight: 800 }}>QUESTIONS?</div><p>Message the church admin on WhatsApp.</p>
      <a className="btn w" href="https://wa.me/263789016651" target="_blank" rel="noopener noreferrer">Let's Talk Now</a></div>
    <footer><div><b>Deliverance Ministries & The Way of God Church Int</b></div><div>{Object.keys(ASSEMBLIES).join(' · ')}</div><div>© 2026 D.M & W.O.G</div></footer>
  </>)
}
