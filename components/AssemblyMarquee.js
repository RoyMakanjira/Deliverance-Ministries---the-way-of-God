import Link from 'next/link'
import { slug } from '@/lib/assemblies'
// Slowly scrolling strip of assembly cards, the same movement as EventMarquee; each card opens the assembly's page.
// assemblies: [{ asm, prov, cover, pastor }]
export default function AssemblyMarquee({ assemblies }) {
  return (
    <div className="marquee asms">
      <div className="marquee-track" style={{ animationDuration: `${assemblies.length * 7}s` }}>
        {[...assemblies, ...assemblies].map((a, i) => { const copy = i >= assemblies.length
          return <div key={i} aria-hidden={copy || undefined}><Link className="asm-card" href={`/assembly/${slug(a.asm)}`} tabIndex={copy ? -1 : undefined}>
            {a.cover ? <img src={a.cover} alt="" loading="lazy" /> : <span className="asm-ph"><img src="/logo.png" alt="" /></span>}
            <span className="asm-body"><b>{a.asm}</b><small>{a.prov}{a.pastor && ` · Pastor ${a.pastor}`}</small><span className="more">Open page →</span></span>
          </Link></div> })}
      </div>
    </div>
  )
}
