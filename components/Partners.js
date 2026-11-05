'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { EVANGELISM } from '@/lib/assemblies'
const FREQ = ['Monthly', 'Quarterly', 'Yearly', 'One time']
// Sign-up for Evangelism Financial Partners; saved with the rest of the giving, for the national admin only
export default function Partners({ how }) {
  const [done, setDone] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function send(e) {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.target))
    const o = { kind: 'Partnership', name: v.name, phone: v.phone, who: v.place || null, dest: EVANGELISM, prov: null, amount: +v.amount, currency: v.currency, frequency: v.frequency, note: v.note || null }
    setBusy(true); setErr('')
    const { error } = await db.from('giving').insert(o)
    setBusy(false)
    if (error) return setErr('Sorry, we could not record this right now. Please try again later.')
    setDone(o); e.target.reset()
  }
  const How = () => <div className="card" style={{ borderTop: '5px solid var(--blue)' }}><h3>{how.title}</h3>{how.body.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ margin: '6px 0' }}>{p}</p>)}</div>
  return (
    <div className="give">
      {done ? <div className="card" style={{ borderTop: '5px solid var(--red)' }}><h3>Thank you, {done.name}! 🙏</h3>
        <p>Welcome as a partner in the gospel. Your support of <b>{done.currency} {done.amount}</b> ({done.frequency.toLowerCase()}) has been recorded and the church will be in touch.</p>
        <button className="btn g" onClick={() => setDone(null)}>Add another partner</button></div>
        : <form className="card" onSubmit={send}>
          <h3>Become a partner</h3>
          <div className="form">
            <div><label>Full name *</label><input name="name" required /></div>
            <div><label>Phone / WhatsApp *</label><input name="phone" type="tel" required /></div>
            <div><label>Where are you based?</label><input name="place" placeholder="Town and country" /></div>
            <div><label>How often? *</label><select name="frequency">{FREQ.map(f => <option key={f}>{f}</option>)}</select></div>
            <div><label>Amount *</label><div style={{ display: 'flex', gap: 6 }}><select name="currency" style={{ width: 90 }}><option>USD</option><option>ZiG</option><option>MZN</option><option>ZAR</option></select>
              <input name="amount" type="number" min="0.01" step="0.01" required inputMode="decimal" /></div></div>
            <div><label>Message (optional)</label><input name="note" /></div>
          </div>
          <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Become a partner'}</button>
          {err && <p style={{ color: 'var(--red)' }}>{err}</p>}
          <p className="mu">Only the national admin can see what you send here.</p>
        </form>}
      <How />
    </div>
  )
}
