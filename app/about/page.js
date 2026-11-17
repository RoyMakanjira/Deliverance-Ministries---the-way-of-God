import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getContent } from '@/lib/site'
import { AboutBlock, More } from '@/components/Blocks'
export const revalidate = 60
export const metadata = { title: 'About Us · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const { get } = await getContent(), about = get('about')
  return (<>
    <SiteHeader active="about" />
    <PageHero title={about.title} />
    <div className="wrap" style={{ paddingTop: 56 }}>
      <AboutBlock about={about} />
      <div className="band" style={{ borderRadius: 22, marginTop: 56 }}><blockquote>The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives, and recovering of sight to the blind, to set at liberty them that are bruised.<cite style={{ display: 'block', fontSize: 13, marginTop: 12 }}>Luke 4:18</cite></blockquote></div>
      <More href="/ministries">See our ministries</More>
    </div>
    <SiteFooter />
  </>)
}
