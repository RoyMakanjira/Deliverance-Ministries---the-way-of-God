import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase as db } from '@/lib/supabase'
import { withDefaults, MINISTRIES } from '@/lib/content'
import Suggestion from '@/components/Suggestion'
import MinistryItems from '@/components/MinistryItems'
import { FbButton } from '@/components/Facebook'
import { FACEBOOK } from '@/lib/social'
import { since, upcoming } from '@/lib/dates'
export const revalidate = 60
export const dynamicParams = false
export const generateStaticParams = () => MINISTRIES.map(key => ({ key }))
// ministries whose page has the anonymous message box
const ANON = ['men', 'women', 'youth']
const Paras = ({ t }) => t.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
export async function generateMetadata({ params }) {
  const m = withDefaults([]).find(s => s.key === params.key)
  return { title: `${m?.title || 'Ministry'} · Deliverance Ministries & The Way of God` }
}
export default async function Ministry({ params }) {
  if (!MINISTRIES.includes(params.key)) notFound()
  const today = new Date().toISOString().slice(0, 10)
  const [{ data }, it, ev] = await Promise.all([db.from('content').select('*'), db.from('ministry_items').select('*').eq('ministry', params.key),
    db.from('events').select('*').contains('ministries', [params.key]).gte('date', since(today)).order('date')])
  const all = withDefaults(data), m = all.find(s => s.key === params.key)
  const others = all.filter(s => MINISTRIES.includes(s.key) && s.key !== m.key)
  return (<>
    <header><Link href="/" className="brand" style={{ margin: 0 }}><img src="/logo.png" alt="logo" /><b>Deliverance Ministries & The Way of God</b></Link>
      <nav><Link href="/#ministries">All ministries</Link><a href="#recent">Recent</a><a href="#upcoming">Upcoming</a><a href="#leadership">Leadership</a><a href="#programs">Programs</a>{ANON.includes(m.key) && <a href="#message">Anonymous message</a>}<a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook</a><Link href="/admin">Admin</Link></nav></header>
    <section className="hero small"><p>Ministry</p><h1>{m.title}</h1>{m.leader && <p>Led by {m.leader}</p>}</section>
    <div className="wrap">
      <div className={`about${m.image_url ? '' : ' solo'}`} style={{ marginTop: 48 }}>{m.image_url && <img src={m.image_url} alt="" />}<div><Paras t={m.body} /></div></div>
      <MinistryItems items={it.data || []} events={upcoming(ev.data, today)} today={today} />
      {ANON.includes(m.key) && <><h2 id="message">Speak to Leadership</h2><Suggestion ministry={m.key} title={m.title} /></>}
      <h2>Other ministries</h2>
      <div className="chips">{others.map(o => <Link key={o.key} href={`/ministry/${o.key}`}>{o.title}</Link>)}</div>
    </div>
    <div className="band cta" style={{ marginTop: 72 }}><div style={{ fontSize: 'clamp(28px,7vw,44px)', fontWeight: 800 }}>STAY CONNECTED</div><p>Follow us on Facebook for services, events and news.</p><FbButton /></div>
    <footer style={{ marginTop: 0 }}><div><b>Deliverance Ministries & The Way of God Church Int</b></div><div><Link href="/">← Back to home</Link></div><div><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook: @wogchurchint</a></div><div>© 2026 D.M & W.O.G</div></footer>
  </>)
}
