'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES } from '@/lib/assemblies'
// Public form: the testimony goes to the national admin, who publishes it
export default function TestimonyForm() {
  const [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  async function send(e) {
    e.preventDefault()
    const v = Object.fromEntries(new FormData(e.target))
    if (v.website) return setSent(true) // hidden field: only bots fill it in
    const body = v.body.trim()
    if (body.length < 20) return setErr('Please tell us a little more about what God has done (at least a sentence or two).')
    setBusy(true); setErr('')
    const { error } = await db.from('testimonies').insert({ name: v.name.trim() || null, asm: v.asm || null, title: v.title.trim() || null, body })
    setBusy(false)
    if (error) return setErr('Sorry, your testimony could not be sent right now. Please try again later.')
    e.target.reset(); setSent(true)
  }
  if (sent) return (
    <div className="card" style={{ textAlign: 'center' }}><h3>Thank you, and glory to God 🙏</h3><p>Your testimony has been sent to the church admin. It will appear on this page once it has been read.</p>
      <button className="btn g" onClick={() => setSent(false)}>Share another testimony</button></div>
  )
  return (
    <form className="card" onSubmit={send}>
      <div className="form">
        <div><label>Your name (leave empty to stay anonymous)</label><input name="name" maxLength={120} /></div>
        <div><label>Assembly</label><select name="asm"><option value="">Choose your assembly</option>
          {Object.entries(ASSEMBLIES).map(([p, a]) => <optgroup key={p} label={p}>{a.map(x => <option key={x}>{x}</option>)}</optgroup>)}
          <option>Other</option></select></div>
        <div style={{ gridColumn: '1/-1' }}><label>Title</label><input name="title" maxLength={150} placeholder="e.g. Healed after years of sickness" /></div>
        <div style={{ gridColumn: '1/-1' }}><label>Your testimony *</label><textarea name="body" required rows={6} maxLength={4000} placeholder="Tell us what God has done for you" /></div>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999 }} />
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send my testimony'}</button>
      <p className="mu">The church admin reads every testimony before it is shown on the site.</p>
      {err && <p style={{ color: 'var(--red)' }}>{err}</p>}
    </form>
  )
}
