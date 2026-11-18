import Link from 'next/link'
import TeamMarquee from '@/components/TeamMarquee'
import EventMarquee from '@/components/EventMarquee'
import AssemblyMarquee from '@/components/AssemblyMarquee'
import Give from '@/components/Give'
import Partners from '@/components/Partners'
import { ASSEMBLIES, slug } from '@/lib/assemblies'
import { EVANGELISM_PHONE, EVANGELISM_TEL, EVANGELISM_WHATSAPP } from '@/lib/social'
// The content of each menu page. The homepage shows the same blocks, so the two never disagree.
export const Paras = ({ t }) => t.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
export const More = ({ href, children }) => <p style={{ textAlign: 'center', marginTop: 20 }}><Link className="btn g" href={href}>{children} →</Link></p>

// the church's name in bold wherever it appears, however it was typed (& or and, extra spaces, Church Int…)
const NAME = /(deliverance\s+ministries\s+(?:&|and)\s+the\s+way\s+of\s+god(?:\s+church)?(?:\s+int(?:ernational\b|\.|\b))?)/gi
const BoldName = ({ t }) => t.split(NAME).map((part, i) => i % 2 ? <strong key={i}>{part.replace(/\s+/g, ' ')}</strong> : part)
const NameParas = ({ t }) => t.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}><BoldName t={p} /></p>)

export const AboutBlock = ({ about }) =>
  <div className={`about${about.image_url ? '' : ' solo'}`}>{about.image_url && <img src={about.image_url} alt="" />}<div><NameParas t={about.body} /></div></div>

export const MinistriesBlock = ({ ministries }) =>
  <div className="grid">{ministries.map(m => <Link href={`/ministry/${m.key}`} className="card ministry" key={m.key}>{m.image_url && <img src={m.image_url} alt="" />}
    <h3>{m.title}</h3>{m.leader && <div className="mu">Led by {m.leader}</div>}<Paras t={m.body} />
    <span className="more">{m.key === 'children' ? 'Open page →' : 'Open page & send an anonymous message →'}</span></Link>)}</div>

export const AssemblyStrip = ({ cards }) => <AssemblyMarquee assemblies={cards} />
export const FindAssembly = () =>
  <div className="grid">{Object.entries(ASSEMBLIES).map(([p, a]) => <div className="card" key={p} style={{ borderTop: '5px solid var(--blue)' }}><h3>{p}</h3>
    <div className="mu">{a.length} {a.length === 1 ? 'assembly' : 'assemblies'}</div><div className="chips" style={{ justifyContent: 'flex-start', marginTop: 10 }}>{a.map(x => <Link key={x} href={`/assembly/${slug(x)}`}>{x}</Link>)}</div></div>)}</div>

export const EventsBlock = ({ events }) => events.length > 0 ? <EventMarquee events={events} /> : <p className="mu" style={{ textAlign: 'center' }}>No upcoming events.</p>

export function ReportsBlock({ reports }) {
  if (!reports.length) return <p className="mu" style={{ textAlign: 'center' }}>No reports yet.</p>
  const b = reports.filter(x => x.women != null), sum = k => b.reduce((a, x) => a + (x[k] || 0), 0)
  return (<>
    {b.length > 0 && <div className="grid stats" style={{ marginBottom: 16 }}>{[['Total present', reports.reduce((a, x) => a + x.count, 0)], ['Women', sum('women')], ['Men', sum('men')], ['Youth', sum('youth')], ['Sunday School', sum('sunday')]].map(([l, n]) => <div className="stat" key={l}><b>{n}</b>{l}</div>)}</div>}
    <div className="grid">{reports.map(x => <div className="card" key={x.id}><h3>{x.title || 'Service report'}</h3>
      <div className="mu">{x.prov}{x.asm && ` · ${x.asm}`} · {x.date}</div><p><b>{x.count}</b> attended{x.women != null && ` (W ${x.women}, M ${x.men}, Youth ${x.youth}, SS ${x.sunday})`}<br />Preacher: {x.preacher || '—'}</p>{x.word && <p><b>The word:</b> {x.word}</p>}</div>)}</div>
  </>)
}

export const GalleryTeaser = ({ pics }) => (<>
  <p style={{ textAlign: 'center', marginTop: 0 }}>Our pictures, our goals, and what God has helped us achieve.</p>
  {pics.length > 0 && <div className="gal home">{pics.map(x => <Link key={x.id} className="gal-item" href="/gallery#pictures"><img src={x.image_url} alt={x.title || 'Church picture'} loading="lazy" /></Link>)}</div>}
  <p style={{ textAlign: 'center' }}><Link className="btn" href="/gallery">Open the gallery →</Link></p>
</>)

// National Executive Board, then the other leaders and the assembly pastors
export const LeadersBlock = ({ heads, top, pastors, H = 'h2' }) => (<>
  <H id="board">National Executive Board</H>
  {heads.length > 0 ? <TeamMarquee people={heads} /> : <p className="mu" style={{ textAlign: 'center' }}>Coming soon.</p>}
  {top.length > 0 && <><H>Meet the Leaders</H><TeamMarquee people={top} /></>}
  {pastors.length > 0 && <><H>Assembly Pastors</H><TeamMarquee people={pastors} /></>}
</>)

export const GiveBlock = ({ how }) => (<>
  <p className="mu" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 20px' }}>“Bring ye all the tithes into the storehouse…” — Malachi 3:10. Choose what you are giving and where it should go: the Bishop’s Wallet or any assembly.</p>
  <Give how={how} />
</>)

export const PartnersBlock = ({ partners, partnerPay }) => (<>
  <div className={`about${partners.image_url ? '' : ' solo'}`} style={{ marginBottom: 20 }}>{partners.image_url && <img src={partners.image_url} alt="" />}<div><Paras t={partners.body} /></div></div>
  <p style={{ textAlign: 'center', margin: '0 0 20px' }}>Speak to the evangelism team: <b>{EVANGELISM_PHONE}</b><br /><a className="btn" href={EVANGELISM_WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a> <a className="btn g" href={`tel:${EVANGELISM_TEL}`}>Call</a></p>
  <Partners how={partnerPay} />
</>)
