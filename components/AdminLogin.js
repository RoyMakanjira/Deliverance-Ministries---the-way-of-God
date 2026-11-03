'use client'
import { useState } from 'react'
import { supabase as db } from '@/lib/supabase'
// Sign-in form shared by the admin dashboards
export default function AdminLogin({ title = 'Admin login', onDone }) {
  const [msg, setMsg] = useState('')
  async function login(e) {
    e.preventDefault(); const f = new FormData(e.target)
    const { error } = await db.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') })
    error ? setMsg(error.message) : onDone()
  }
  return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}><h2 style={{ marginTop: 0 }}>{title}</h2>
      <form className="card" onSubmit={login}>
        <div><label>Email</label><input name="email" type="email" required /></div><br />
        <div><label>Password</label><input name="password" type="password" required /></div><br />
        <button className="btn">Sign in</button><p className="mu">{msg || 'Sign in with the account your national admin created for you.'}</p></form></div>
  )
}
