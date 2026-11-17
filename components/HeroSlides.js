'use client'
import { useEffect, useState } from 'react'
// Full-width church pictures behind the banner text, fading from one to the next every 6 seconds.
// Dots let visitors pick a picture. Pictures don't change by themselves for people who turn motion off.
export default function HeroSlides({ pics }) {
  const [on, setOn] = useState(0)
  useEffect(() => {
    if (pics.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setOn(i => (i + 1) % pics.length), 6000)
    return () => clearInterval(t)
  }, [pics.length])
  return (<>
    <div className="hero-slides" aria-hidden="true">
      {pics.map((p, i) => <div key={p} className={`hero-slide${i === on ? ' on' : ''}`} style={{ backgroundImage: `url("${p}")` }} />)}
    </div>
    {pics.length > 1 && <div className="hero-dots">{pics.map((p, i) =>
      <button key={p} type="button" className={i === on ? 'on' : ''} aria-label={`Show picture ${i + 1} of ${pics.length}`} aria-pressed={i === on} onClick={() => setOn(i)} />)}</div>}
  </>)
}
