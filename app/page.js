import { supabase as db } from '@/lib/supabase'
import Register from '@/components/Register'
import Person from '@/components/Person'
import Link from 'next/link'
import { ASSEMBLIES, slug } from '@/lib/assemblies'
import { withDefaults, MINISTRIES } from '@/lib/content'
import Give from '@/components/Give'
import Hero from '@/components/Hero'
import { FbButton } from '@/components/Facebook'
import { FACEBOOK, WHATSAPP } from '@/lib/social'
export const revalidate = 60
const Paras = ({ t }) => t.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
const ORD = ['Bishop', 'Overseer', 'Secretary', 'Treasurer', 'Administrator']
const oi = r => (ORD.indexOf(r) < 0 ? 9 : ORD.indexOf(r))
export default async function Home() {
  const today = new Date().toISOString().slice(0, 10)
  const [r, e, t, c] = await Promise.all([
    db.from('reports').select('*').order('date', { ascending: false }).limit(12),
    db.from('events').select('*').gte('date', today).order('date'),
    db.from('team').select('*').order('name'),
    db.from('content').select('*'),
  ])
  const sections = withDefaults(c.data), about = sections.find(s => s.key === 'about'), how = sections.find(s => s.key === 'giving')
  const ministries = sections.filter(s => MINISTRIES.includes(s.key))
  const reports = r.data || [], events = e.data || [], team = t.data || []
  const b = reports.filter(x => x.women != null)
  const sum = k => b.reduce((a, x) => a + (x[k] || 0), 0)
  const top = team.filter(x => x.role !== 'Assembly Pastor').sort((a, c) => oi(a.role) - oi(c.role))
  const pastors = team.filter(x => x.role === 'Assembly Pastor')
  return (<>
    <header><div className="brand"><img src="/logo.png" alt="logo" /><b>Deliverance Ministries & The Way of God</b></div>
      <nav><a href="#about">About</a><a href="#ministries">Ministries</a><a href="#assemblies">Assemblies</a><a href="#reports">Reports</a><a href="#events">Events</a><a href="#team">Team</a><a href="#give">Give</a><a href="#register">Register</a><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook</a><a href="/admin">Admin</a></nav></header>
    <Hero />
    <div className="band"><blockquote>I am the way, the truth, and the life: no man cometh unto the Father, but by me.<cite style={{ display: 'block', fontSize: 13, marginTop: 12 }}>John 14:6</cite></blockquote></div>
    <div className="wrap">
      <h2 id="about">{about.title}</h2>
      <div className={`about${about.image_url ? '' : ' solo'}`}>{about.image_url && <img src={about.image_url} alt="" />}<div><Paras t={about.body} /></div></div>
      <h2 id="ministries">Our Ministries</h2>
      <div className="grid">{ministries.map(m => <div className="card ministry" key={m.key}>{m.image_url && <img src={m.image_url} alt="" />}
        <h3>{m.title}</h3>{m.leader && <div className="mu">Led by {m.leader}</div>}<Paras t={m.body} /></div>)}</div>
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
      <h2 id="give">Tithes, Donations &amp; Pledges</h2>
      <p className="mu" style={{ textAlign: 'center', maxWidth: 640, margin: '-10px auto 20px' }}>“Bring ye all the tithes into the storehouse…” — Malachi 3:10. Choose what you are giving and where it should go: the Bishop’s Wallet or any assembly.</p>
      <Give how={how} />
      <h2 id="register">Join us / Register</h2><Register />
    </div>
    <div className="band cta" style={{ marginTop: 72 }}><div style={{ fontSize: 'clamp(34px,10vw,56px)', fontWeight: 800 }}>QUESTIONS?</div><p>Message the church admin on WhatsApp, or follow us on Facebook for services, events and news.</p>
      <a className="btn w" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Let's Talk Now</a><FbButton /></div>
    <footer><div><b>Deliverance Ministries & The Way of God Church Int</b></div><div>{Object.keys(ASSEMBLIES).join(' · ')}</div><div><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook: @wogchurchint</a></div><div>© 2026 D.M & W.O.G</div></footer>
  </>)
}
