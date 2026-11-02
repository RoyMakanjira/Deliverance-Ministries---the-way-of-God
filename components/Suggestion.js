'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES } from '@/lib/assemblies'
export const TOPICS = ['Leadership', 'Services & worship', 'Teaching & preaching', 'Finances & giving', 'Buildings & facilities', 'Ministry activities', 'Relationships & conduct', 'Other']
// Anonymous message box: nothing that identifies the sender is collected or stored
export default function Suggestion({ ministry, title }) {
  const [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  async function send(e) {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.target))
    const message = v.message.trim()
    if (message.length < 5) return setErr('Please write a little more.')
    setBusy(true); setErr('')
    const { error } = await db.from('feedback').insert({ ministry, topic: v.topic || null, asm: v.asm || null, message })
    setBusy(false)
    if (error) return setErr('Sorry, your message could not be sent right now. Please try again later.')
    e.target.reset(); setSent(true)
  }
  if (sent) return (
    <div className="card anon"><h3>Thank you 🙏</h3><p>Your message has been sent to the church leadership anonymously. We take every message seriously.</p>
      <button className="btn g" onClick={() => setSent(false)}>Send another message</button></div>
  )
  return (
    <form className="card anon" onSubmit={send}>
      <h3>🔒 Anonymous message to leadership</h3>
      <p className="mu" style={{ marginTop: 0 }}>Is there something in the church or the {title} that the leadership needs to fix or improve? Tell us here. <b>You do not give your name, and nothing that identifies you is saved.</b> Only the national leadership can read these messages.</p>
      <div className="form">
        <div><label>What is it about? (optional)</label><select name="topic" defaultValue=""><option value="">Choose…</option>{TOPICS.map(t => <option key={t}>{t}</option>)}</select></div>
        <div><label>Which assembly? (optional)</label><select name="asm" defaultValue=""><option value="">Prefer not to say</option>
          {Object.entries(ASSEMBLIES).map(([p, a]) => <optgroup key={p} label={p}>{a.map(x => <option key={x}>{x}</option>)}</optgroup>)}</select></div>
      </div>
      <label>Your message *</label><textarea name="message" rows="5" required maxLength={3000} placeholder="Write what needs attention and, if you can, how it could be fixed…" />
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send anonymously'}</button>
      {err && <p style={{ color: 'var(--red)' }}>{err}</p>}
    </form>
  )
}
