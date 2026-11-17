import Link from 'next/link'
import { getLive } from '@/lib/live'
import { FbButton } from '@/components/Facebook'
import { ASSEMBLIES } from '@/lib/assemblies'
import { FACEBOOK, WHATSAPP } from '@/lib/social'
// Menu shared by every public page; each button opens its own page. Give and Partners stay red.
const PAGES = [
  ['/', 'Home', 'home'], ['/about', 'About', 'about'], ['/ministries', 'Ministries', 'ministries'], ['/assemblies', 'Assemblies', 'assemblies'],
  ['/events', 'Events', 'events'], ['/leaders', 'Leaders', 'leaders'], ['/reports', 'Reports', 'reports'], ['/gallery', 'Gallery', 'gallery'],
  ['/give', 'Give', 'give', 'on'], ['/partners', 'Partners', 'partners', 'on'], ['/register', 'Register', 'register'],
]
export async function SiteHeader({ active }) {
  const live = await getLive()
  return (
    <header><Link href="/" className="brand" style={{ margin: 0 }}><img src="/logo.png" alt="logo" /><b>Deliverance Ministries & The Way of God</b></Link>
      <nav>{live && <Link className={`on${active === 'live' ? ' cur' : ''}`} href="/live">🔴 Watch Live</Link>}
        {PAGES.map(([href, label, key, cls]) => <Link key={key} href={href} className={[cls, active === key && 'cur'].filter(Boolean).join(' ') || undefined} aria-current={active === key ? 'page' : undefined}>{label}</Link>)}
        <a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook</a><Link href="/admin">Admin</Link></nav></header>
  )
}
// Banner at the top of each menu page
export const PageHero = ({ kicker = 'Deliverance Ministries & The Way of God', title, children }) =>
  <section className="hero small"><p>{kicker}</p><h1>{title}</h1>{children && <p>{children}</p>}</section>
// Questions band and footer shared by every public page
export const SiteFooter = () => (<>
  <div className="band cta" style={{ marginTop: 72 }}><div style={{ fontSize: 'clamp(34px,10vw,56px)', fontWeight: 800 }}>QUESTIONS?</div><p>Message the church admin on WhatsApp, or follow us on Facebook for services, events and news.</p>
    <a className="btn w" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Let's Talk Now</a><FbButton /></div>
  <footer style={{ marginTop: 0 }}><div><b>Deliverance Ministries & The Way of God Church Int</b></div><div>{Object.keys(ASSEMBLIES).join(' · ')}</div>
    <div className="foot-links">{PAGES.slice(1).map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</div>
    <div><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook: @wogchurchint</a></div><div>© 2026 D.M & W.O.G</div></footer>
</>)
// "On this page" links under a page banner, for long pages
export const OnThisPage = ({ links }) => <div className="chips" style={{ marginTop: 28 }}>{links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</div>
