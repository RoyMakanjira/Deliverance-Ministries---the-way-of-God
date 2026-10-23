// Animated welcome banner. Pure CSS (see .hero-* in globals.css); motion is switched off for prefers-reduced-motion.
const LINES = [['Deliverance', 'Ministries'], ['&', 'The', 'Way', 'of', 'God']]
// fixed pseudo-random sparkles so server and browser render the same markup
const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100, size: 3 + ((i * 7) % 5), dur: 9 + ((i * 5) % 9), delay: -((i * 13) % 17),
}))
export default function Hero() {
  let n = 0
  return (
    <section className="hero hero-magic">
      <div className="hero-bg" aria-hidden="true" /><div className="hero-rays" aria-hidden="true" />
      <div className="hero-sparks" aria-hidden="true">{SPARKS.map((s, i) => <span key={i} style={{ left: `${s.left}%`, width: s.size, height: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }} />)}</div>
      <div className="hero-logo"><img src="/logo.png" alt="" width="130" /></div>
      <p className="hero-in" style={{ animationDelay: '.3s' }}><span className="hero-welcome">Welcome to</span></p>
      <h1 aria-label="Deliverance Ministries & The Way of God">{LINES.map((ws, li) => <span key={li} className="hero-line" aria-hidden="true">
        {ws.map(w => <span key={w} className={`hero-word${w === 'God' ? ' hero-god' : ''}`} style={{ animationDelay: `${0.6 + 0.16 * n++}s` }}>{w}</span>)}</span>)}</h1>
      <p className="hero-in" style={{ animationDelay: '1.9s' }}>Church International</p>
      <div className="hero-in" style={{ animationDelay: '2.2s' }}><a className="btn w" href="#register">Join Us</a><a className="btn w" href="#give">Give</a><a className="btn w" href="#reports">Latest Reports</a></div>
      <a href="#about" className="hero-scroll hero-in" style={{ animationDelay: '2.8s' }} aria-label="Scroll down"><span /></a>
    </section>
  )
}
