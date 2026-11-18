'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES } from '@/lib/assemblies'
// Public form: the testimony (and an optional picture or video) goes to the national admin, who publishes it
const MAX_MB = 50
export default function TestimonyForm() {
  const [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  async function send(e) {
    e.preventDefault()
    const v = Object.fromEntries(new FormData(e.target))
    if (v.website) return setSent(true) // hidden field: only bots fill it in
    const body = v.body.trim()
    if (body.length < 20) return setErr('Please tell us a little more about what God has done (at least a sentence or two).')
    const file = v.media?.size ? v.media : null
    if (file && !/^(image|video)\//.test(file.type)) return setErr('Please choose a picture or a video.')
    if (file && file.size > MAX_MB * 1024 * 1024) return setErr(`That file is too big. Please choose one under ${MAX_MB} MB (a shorter video).`)
    setBusy(true); setErr('')
    let image_url = null, media_type = 'image'
    if (file) {
      const ext = (file.name.match(/\.([a-z0-9]{2,5})$/i)?.[1] || file.type.split('/')[1] || '').toLowerCase()
      const path = `testimonies-inbox/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const up = await db.storage.from('team').upload(path, file, { contentType: file.type })
      if (up.error) { setBusy(false); return setErr(up.error.message.includes('size') ? `That file is too big. Please choose one under ${MAX_MB} MB.` : 'Sorry, your picture or video could not be uploaded. Try a different file, or send the testimony without it.') }
      image_url = db.storage.from('team').getPublicUrl(path).data.publicUrl; media_type = file.type.startsWith('video') ? 'video' : 'image'
    }
    const { error } = await db.from('testimonies').insert({ name: v.name.trim() || null, asm: v.asm || null, title: v.title.trim() || null, body, ...(image_url && { image_url, media_type }) })
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
        <div style={{ gridColumn: '1/-1' }}><label>Picture or video (optional, under 50 MB)</label><input name="media" type="file" accept="image/*,video/*" /></div>
        <div style={{ gridColumn: '1/-1' }}><label>Your testimony *</label><textarea name="body" required rows={6} maxLength={4000} placeholder="Tell us what God has done for you" /></div>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999 }} />
      <button className="btn" disabled={busy}>{busy ? 'Sending… (videos can take a minute)' : 'Send my testimony'}</button>
      <p className="mu">The church admin reads every testimony before it is shown on the site.</p>
      {err && <p style={{ color: 'var(--red)' }}>{err}</p>}
    </form>
  )
}
