import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { supabase as db } from '@/lib/supabase'
import Testimony from '@/components/Testimony'
import TestimonyForm from '@/components/TestimonyForm'
export const revalidate = 60
export const metadata = { title: 'Testimonies · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const { data } = await db.from('testimonies').select('*').eq('published', true).order('created_at', { ascending: false })
  const rows = data || []
  return (<>
    <SiteHeader active="testimonies" />
    <PageHero title="Testimonies">“And they overcame him by the blood of the Lamb, and by the word of their testimony.” — Revelation 12:11</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      <p style={{ textAlign: 'center', margin: '0 0 20px' }}><a className="btn" href="#share">Share your testimony</a></p>
      {rows.length ? <div className="tes-grid">{rows.map(x => <Testimony key={x.id} x={x} />)}</div>
        : <p className="mu" style={{ textAlign: 'center' }}>Testimonies coming soon. Be the first to share what God has done for you.</p>}
      <h2 id="share">Share your testimony</h2>
      <div style={{ maxWidth: 760, margin: '0 auto' }}><TestimonyForm /></div>
    </div>
    <SiteFooter />
  </>)
}
