'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
// Where invite links land (see inviteScript in lib/theme.js); signed-in admins also use it to change their password
export default function SetPassword() {
  const [state, setState] = useState('loading'), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => {
    const expired = window.location.hash.includes('error_code=')
    db.auth.getSession().then(({ data: { session } }) => setState(session ? 'form' : expired ? 'expired' : 'none'))
  }, [])
  async function save(e) {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.target))
    if (v.password.length < 8) return setErr('Use at least 8 characters.')
    if (v.password !== v.again) return setErr('The two passwords do not match.')
    setBusy(true); setErr('')
    const { error } = await db.auth.updateUser({ password: v.password })
    setBusy(false)
    if (error) return setErr(error.message)
    window.location.replace('/admin')
  }
  return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}><h2 style={{ marginTop: 0 }}>Set your password</h2>
      {state === 'loading' && <p className="mu">Loading…</p>}
      {state === 'expired' && <p className="card">This link has expired or was already used. Please ask the national admin to send a new invitation.</p>}
      {state === 'none' && <p className="card">Open this page from your invitation email, or <a href="/admin">sign in</a> first to change your password.</p>}
      {state === 'form' && <form className="card" onSubmit={save}>
        <div><label>New password</label><input name="password" type="password" autoComplete="new-password" required minLength={8} /></div><br />
        <div><label>Type it again</label><input name="again" type="password" autoComplete="new-password" required minLength={8} /></div><br />
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
        {err && <p style={{ color: 'var(--red)' }}>{err}</p>}</form>}
    </div>
  )
}
