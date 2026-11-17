import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import Register from '@/components/Register'
export const revalidate = 60
export const metadata = { title: 'Join Us / Register · Deliverance Ministries & The Way of God' }
export default async function Page() {

  return (<>
    <SiteHeader active="register" />
    <PageHero title="Join Us / Register">Fill in your details and the church admin will welcome you.</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      <Register />
    </div>
    <SiteFooter />
  </>)
}
