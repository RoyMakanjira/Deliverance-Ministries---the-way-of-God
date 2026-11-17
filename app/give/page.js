import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getContent } from '@/lib/site'
import { GiveBlock } from '@/components/Blocks'
export const revalidate = 60
export const metadata = { title: 'Tithes, Donations & Pledges · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const { get } = await getContent()
  return (<>
    <SiteHeader active="give" />
    <PageHero title="Tithes, Donations & Pledges" />
    <div className="wrap" style={{ paddingTop: 56 }}>
      <GiveBlock how={get('giving')} />
    </div>
    <SiteFooter />
  </>)
}
