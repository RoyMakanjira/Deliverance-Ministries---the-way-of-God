import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getTeam } from '@/lib/site'
import { LeadersBlock } from '@/components/Blocks'
export const revalidate = 60
export const metadata = { title: 'Our Leaders · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const team = await getTeam()
  return (<>
    <SiteHeader active="leaders" />
    <PageHero title="Our Leaders">The National Executive Board, our leaders and our assembly pastors.</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      <div className="first-h2"><LeadersBlock {...team} /></div>
    </div>
    <SiteFooter />
  </>)
}
