// Welcome banner: the church name on top of full-width church pictures (see .hero-* in globals.css).
// pics: picture links chosen in the admin page; without any, the original church picture.
import HeroSlides from '@/components/HeroSlides'
const LINES = [['Deliverance', 'Ministries'], ['&', 'The', 'Way', 'of', 'God']]
export default function Hero({ hasReports, pics = [] }) {
  let n = 0
  return (
    <section className="hero hero-magic">
      <HeroSlides pics={pics.length ? pics : ['/hero.jpg']} /><div className="hero-shade" aria-hidden="true" />
      <p className="hero-in" style={{ animationDelay: '.3s' }}><span className="hero-welcome">Welcome to</span></p>
      <h1 aria-label="Deliverance Ministries & The Way of God">{LINES.map((ws, li) => <span key={li} className="hero-line" aria-hidden="true">
        {ws.map(w => <span key={w} className={`hero-word${w === 'God' ? ' hero-god' : ''}`} style={{ animationDelay: `${0.6 + 0.16 * n++}s` }}>{w}</span>)}</span>)}</h1>
      <p className="hero-in" style={{ animationDelay: '1.9s' }}>Church International</p>
      <div className="hero-in" style={{ animationDelay: '2.2s' }}><a className="btn w" href="/register">Join Us</a><a className="btn w" href="/give">Give</a>{hasReports && <a className="btn w" href="/reports">Latest Reports</a>}</div>
      <a href="#about" className="hero-scroll hero-in" style={{ animationDelay: '2.8s' }} aria-label="Scroll down"><span /></a>
    </section>
  )
}
