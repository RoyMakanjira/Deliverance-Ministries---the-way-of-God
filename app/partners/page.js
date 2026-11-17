import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getContent } from '@/lib/site'
import { PartnersBlock } from '@/components/Blocks'
export const revalidate = 60
export const metadata = { title: 'Evangelism Financial Partners · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const { get } = await getContent()
  return (<>
    <SiteHeader active="partners" />
    <PageHero title={get('partners').title} />
    <div className="wrap" style={{ paddingTop: 56 }}>
      <PartnersBlock partners={get('partners')} partnerPay={get('partner-pay')} />
    </div>
    <SiteFooter />
  </>)
}
