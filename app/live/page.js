import { SiteHeader, SiteFooter } from '@/components/Site'
import Link from 'next/link'
import { getLive } from '@/lib/live'
import LivePlayer from '@/components/LivePlayer'
import { FbButton } from '@/components/Facebook'
import { FACEBOOK } from '@/lib/social'
export const revalidate = 30
export const metadata = { title: 'Watch Live · Deliverance Ministries & The Way of God' }
export default async function Live() {
  const live = await getLive()
  return (<>
    <SiteHeader active="live" />
    <div className="wrap" style={{ paddingTop: 32 }}>
      <h2 style={{ marginTop: 0 }}>Watch Live</h2>
      {live ? <LivePlayer live={live} /> : <div className="card" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <p>We are not live right now. When a service or event is being streamed, it will play here.</p>
        <p className="mu">Follow us on Facebook to be told when we go live, and to watch past services.</p><FbButton /></div>}
    </div>
    <SiteFooter />
  </>)
}
