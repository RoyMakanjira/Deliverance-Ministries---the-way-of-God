import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getContent } from '@/lib/site'
import { MINISTRIES } from '@/lib/content'
import { MinistriesBlock } from '@/components/Blocks'
export const revalidate = 60
export const metadata = { title: 'Our Ministries · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const { sections } = await getContent()
  return (<>
    <SiteHeader active="ministries" />
    <PageHero title="Our Ministries">Men, women, youth and children. Open a ministry to see its events, leaders and programs.</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      <MinistriesBlock ministries={sections.filter(s => MINISTRIES.includes(s.key))} />
    </div>
    <SiteFooter />
  </>)
}
