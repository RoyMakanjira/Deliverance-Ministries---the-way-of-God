import { SiteHeader, SiteFooter, OnThisPage } from '@/components/Site'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase as db } from '@/lib/supabase'
import { withDefaults, MINISTRIES } from '@/lib/content'
import Suggestion from '@/components/Suggestion'
import MinistryItems from '@/components/MinistryItems'
import { FbButton } from '@/components/Facebook'
import { FACEBOOK } from '@/lib/social'
import { since, upcoming, today as todayZW } from '@/lib/dates'
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
  const today = todayZW()
  const [{ data }, it, ev] = await Promise.all([db.from('content').select('*'), db.from('ministry_items').select('*').eq('ministry', params.key),
    db.from('events').select('*').contains('ministries', [params.key]).gte('date', since(today)).order('date')])
  const all = withDefaults(data), m = all.find(s => s.key === params.key)
  const others = all.filter(s => MINISTRIES.includes(s.key) && s.key !== m.key)
  return (<>
    <SiteHeader active="ministries" />
    <section className="hero small"><p>Ministry</p><h1>{m.title}</h1>{m.leader && <p>Led by {m.leader}</p>}</section>
    <div className="wrap">
      <OnThisPage links={[['#recent', 'Recent'], ['#upcoming', 'Upcoming'], ['#leadership', 'Leadership'], ['#programs', 'Programs'], ...(ANON.includes(m.key) ? [['#message', 'Anonymous message']] : []), ['/ministries', 'All ministries']]} />
      <div className={`about${m.image_url ? '' : ' solo'}`} style={{ marginTop: 48 }}>{m.image_url && <img src={m.image_url} alt="" />}<div><Paras t={m.body} /></div></div>
      <MinistryItems items={it.data || []} events={upcoming(ev.data, today)} today={today} />
      {ANON.includes(m.key) && <><h2 id="message">Speak to Leadership</h2><Suggestion ministry={m.key} title={m.title} /></>}
      <h2>Other ministries</h2>
      <div className="chips">{others.map(o => <Link key={o.key} href={`/ministry/${o.key}`}>{o.title}</Link>)}</div>
    </div>
    <SiteFooter />
  </>)
}
