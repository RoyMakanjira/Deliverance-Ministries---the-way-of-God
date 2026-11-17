import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getReports } from '@/lib/site'
import { ReportsBlock } from '@/components/Blocks'
export const revalidate = 60
export const metadata = { title: 'Latest Reports · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const reports = await getReports(24)
  return (<>
    <SiteHeader active="reports" />
    <PageHero title="Latest Reports">Attendance and the word preached at our recent services.</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      <ReportsBlock reports={reports} />
    </div>
    <SiteFooter />
  </>)
}
