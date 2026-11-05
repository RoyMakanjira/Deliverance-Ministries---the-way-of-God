'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES, provOf } from '@/lib/assemblies'
export default function Register() {
  const [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  async function send(e) {
    e.preventDefault()
    const v = Object.fromEntries(new FormData(e.target))
    if (v.website) return setSent(true) // hidden field: only bots fill it in
    const name = v.name.trim()
    if (name.length < 2) return setErr('Please enter your full name.')
    setBusy(true); setErr('')
    const { error } = await db.from('members').insert({ name, phone: v.phone || null, gender: v.gender || null, dob: v.dob || null, addr: v.addr || null, asm: v.asm, prov: provOf(v.asm) || 'Other', ministry: v.min || null, status: 'New Registration' })
    setBusy(false)
    if (error) return setErr('Sorry, your registration could not be sent right now. Please try again later.')
    e.target.reset(); setSent(true)
  }
  if (sent) return (
    <div className="card"><h3>Thank you 🙏</h3><p>Your registration has been received by the church admin. Welcome to the family!</p>
      <button className="btn g" onClick={() => setSent(false)}>Register someone else</button></div>
  )
  return (
    <form className="card" onSubmit={send}>
      <div className="form">
        <div><label>Full name *</label><input name="name" required maxLength={120} /></div>
        <div><label>Phone / WhatsApp</label><input name="phone" /></div>
        <div><label>Gender</label><select name="gender"><option></option><option>Male</option><option>Female</option></select></div>
        <div><label>Date of birth</label><input name="dob" type="date" /></div>
        <div><label>Address</label><input name="addr" /></div>
        <div><label>Assembly *</label><select name="asm" required><option value="">Choose your assembly</option>
          {Object.entries(ASSEMBLIES).map(([p, a]) => <optgroup key={p} label={p}>{a.map(x => <option key={x}>{x}</option>)}</optgroup>)}
          <option>Other / not sure</option></select></div>
        <div><label>Ministry (optional)</label><input name="min" /></div>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999 }} />
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Register'}</button>
      <p className="mu">Your details go straight to the church admin.</p>
      {err && <p style={{ color: 'var(--red)' }}>{err}</p>}
    </form>
  )
}
