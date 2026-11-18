import { fmtDate } from '@/lib/dates'
// One published testimony as a quote card
export default function Testimony({ x, short }) {
  const text = short && x.body.length > 260 ? x.body.slice(0, 250).replace(/\s+\S*$/, '') + '…' : x.body
  return (
    <figure className="card testimony">
      {x.image_url && !short && <img src={x.image_url} alt="" loading="lazy" />}
      <div className="tes-body">
        <span className="tes-mark" aria-hidden="true">“</span>
        {x.title && <h3>{x.title}</h3>}
        <blockquote>{text.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</blockquote>
        <figcaption><b>{x.name || 'A church member'}</b>{x.asm && <span> · {x.asm}</span>}<small>{fmtDate(x.created_at.slice(0, 10))}</small></figcaption>
      </div>
    </figure>
  )
}
