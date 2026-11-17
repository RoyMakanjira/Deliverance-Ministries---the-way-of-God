import { SiteHeader, PageHero, SiteFooter } from '@/components/Site'
import { getTeam, getAsmCards } from '@/lib/site'
import { AssemblyStrip, FindAssembly } from '@/components/Blocks'
import { ASSEMBLIES } from '@/lib/assemblies'
export const revalidate = 60
export const metadata = { title: 'Our Assemblies · Deliverance Ministries & The Way of God' }
export default async function Page() {
  const cards = await getAsmCards((await getTeam()).pastors)
  return (<>
    <SiteHeader active="assemblies" />
    <PageHero title="Our Assemblies">{Object.values(ASSEMBLIES).flat().length} assemblies in {Object.keys(ASSEMBLIES).join(', ')}. Open one to see where it is, its pastor and pictures.</PageHero>
    <div className="wrap" style={{ paddingTop: 56 }}>
      <AssemblyStrip cards={cards} />
      <h2>Find an assembly</h2>
      <FindAssembly />
    </div>
    <SiteFooter />
  </>)
}
