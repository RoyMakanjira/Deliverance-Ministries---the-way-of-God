'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES, BISHOP, provOf } from '@/lib/assemblies'
const NAT = '263789016651'
const KINDS = [['Tithe', 'Pay my tithe'], ['Donation', 'Give a donation / offering'], ['Pledge', 'Make a pledge']]
export default function Give({ how }) {
  const [kind, setKind] = useState('Tithe'), [done, setDone] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function send(e) {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.target))
    const o = { kind, name: v.name, phone: v.phone || null, who: v.who, dest: v.dest, prov: provOf(v.dest) || null, amount: +v.amount, currency: v.currency, method: v.method || null, ref: v.ref || null, due: v.due || null, note: v.note || null }
    setBusy(true); setErr('')
    const { error } = await db.from('giving').insert(o)
    setBusy(false)
    if (error) return setErr('Sorry, we could not record this right now. Please send it to the admin on WhatsApp instead.')
    setDone(o); e.target.reset()
  }
  const wa = o => `https://wa.me/${NAT}?text=${encodeURIComponent([o.kind.toUpperCase(), `Name: ${o.name}`, `Phone: ${o.phone || '—'}`, `To: ${o.dest}`, `Amount: ${o.currency} ${o.amount}`, o.method && `Method: ${o.method}`, o.ref && `Reference: ${o.ref}`, o.due && `Pledge due: ${o.due}`, o.note && `Note: ${o.note}`].filter(Boolean).join('\n'))}`
  const How = () => <div className="card" style={{ borderTop: '5px solid var(--blue)' }}><h3>{how.title}</h3>{how.body.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ margin: '6px 0' }}>{p}</p>)}</div>
  if (done) return (
    <div className="give">
      <div className="card" style={{ borderTop: '5px solid var(--red)' }}><h3>Thank you, {done.name}! 🙏</h3>
        <p>Your {done.kind.toLowerCase()} of <b>{done.currency} {done.amount}</b> to <b>{done.dest}</b> has been recorded.{done.kind === 'Pledge' ? ' We will be in touch about your pledge.' : ' Once the church receives your payment it will be marked as received.'}</p>
        <a className="btn" href={wa(done)} target="_blank" rel="noopener noreferrer">Send confirmation on WhatsApp</a><button className="btn g" onClick={() => setDone(null)}>Give again</button></div>
      <How />
    </div>
  )
  return (
    <div className="give">
      <form className="card" onSubmit={send}>
        <div className="tabs">{KINDS.map(([k, l]) => <button type="button" key={k} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>{l}</button>)}</div>
        <div className="form">
          <div><label>Where is it going? *</label><select name="dest" required defaultValue=""><option value="" disabled>Choose…</option><option>{BISHOP}</option>
            {Object.entries(ASSEMBLIES).map(([p, a]) => <optgroup key={p} label={`${p} assemblies`}>{a.map(x => <option key={x}>{x}</option>)}</optgroup>)}</select></div>
          <div><label>Amount *</label><div style={{ display: 'flex', gap: 6 }}><select name="currency" style={{ width: 90 }}><option>USD</option><option>ZiG</option><option>MZN</option><option>ZAR</option></select>
            <input name="amount" type="number" min="0.01" step="0.01" required inputMode="decimal" /></div></div>
          <div><label>Full name *</label><input name="name" required /></div>
          <div><label>Phone / WhatsApp</label><input name="phone" type="tel" /></div>
          <div><label>I am a</label><select name="who" defaultValue={kind === 'Tithe' ? 'Member' : 'Well-wisher'} key={kind}><option>Member</option><option>Well-wisher</option><option>Visitor</option></select></div>
          {kind === 'Pledge' ? <div><label>I will pay by</label><input name="due" type="date" /></div>
            : <div><label>Paid with</label><select name="method"><option></option><option>EcoCash</option><option>InnBucks</option><option>OneMoney</option><option>M-Pesa</option><option>Bank transfer</option><option>Cash</option></select></div>}
          {kind !== 'Pledge' && <div><label>Transaction reference (if paid)</label><input name="ref" /></div>}
          <div><label>Message (optional)</label><input name="note" /></div>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : kind === 'Pledge' ? 'Make my pledge' : `Record my ${kind.toLowerCase()}`}</button>
        {err && <p style={{ color: 'var(--red)' }}>{err}</p>}
        <p className="mu">Only church admins can see what you send here.</p>
      </form>
      <How />
    </div>
  )
}
