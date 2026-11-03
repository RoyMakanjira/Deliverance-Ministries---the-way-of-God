'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase as db } from '@/lib/supabase'
import AdminLogin from '@/components/AdminLogin'
const MIN = { men: "Men's", women: "Women's", youth: 'Youth' }, ST = ['New', 'Read', 'Being handled', 'Resolved']
// Anonymous messages dashboard: the national admin sees every ministry, a ministry leader only their own (enforced by RLS)
export default function Messages() {
  const [me, setMe] = useState(null), [ready, setReady] = useState(false), [notes, setNotes] = useState([])
  const [nf, setNf] = useState({ ministry: '', status: '' }), [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data: { user } } = await db.auth.getUser()
    if (user) {
      const { data: s } = await db.from('staff').select('*').eq('user_id', user.id).maybeSingle()
      setMe(s)
      if (s) setNotes((await db.from('feedback').select('*').order('created_at', { ascending: false })).data || [])
    }
    setReady(true)
  }, [])
  useEffect(() => { load() }, [load])
  async function setStatus(n, status) {
    const { error } = await db.from('feedback').update({ status }).eq('id', n.id)
    if (error) return setMsg(error.message)
    setNotes(notes.map(x => x.id === n.id ? { ...x, status } : x))
  }
  async function del(n) { if (confirm('Delete this message?')) { await db.from('feedback').delete().eq('id', n.id); setNotes(notes.filter(x => x.id !== n.id)) } }
  if (!ready) return <p style={{ padding: 20 }}>Loading…</p>
  if (!me) return <AdminLogin title="Anonymous messages — sign in" onDone={load} />
  const signOut = <button className="btn g" onClick={async () => { await db.auth.signOut(); setMe(null) }}>Sign out</button>
  const sup = me.role === 'super', mine = me.role === 'ministry'
  if (!sup && !mine) return (
    <div className="wrap" style={{ paddingTop: 20 }}><p><a href="/admin">← Admin dashboard</a> · {signOut}</p>
      <p className="mu">The anonymous messages dashboard is for the national admin and the ministry leaders.</p></div>
  )
  const rows = notes.filter(n => (!nf.ministry || n.ministry === nf.ministry) && (!nf.status || n.status === nf.status))
  return (
    <div className="wrap" style={{ paddingTop: 20 }}>
      <p><a href="/">← Home</a>{sup && <> · <a href="/admin">National admin dashboard</a></>} · {sup ? 'National admin' : `${MIN[me.ministry]} Ministry leader`} · {signOut} <b>{msg}</b></p>
      <h2 style={{ marginTop: 10 }}>{mine ? `${MIN[me.ministry]} Ministry — anonymous messages` : 'Anonymous messages'}</h2>
      <p className="mu" style={{ textAlign: 'center' }}>{mine ? <>Sent from the <a href={`/ministry/${me.ministry}`}>{MIN[me.ministry]} Ministry page</a>.</> : "Sent from the Men's, Women's and Youth ministry pages."} The sender's name is never collected. Mark each message as you deal with it{mine && ' — the national admin can see the status too'}.</p>
      <div className="grid stats">{['New', 'Being handled', 'Resolved'].map(l => <div className="stat" key={l}><b>{notes.filter(n => n.status === l).length}</b>{l}</div>)}</div>
      <div className="form">{sup && <select value={nf.ministry} onChange={e => setNf({ ...nf, ministry: e.target.value })}><option value="">All ministries</option>{Object.entries(MIN).map(([k, v]) => <option key={k} value={k}>{v} Ministry</option>)}</select>}
        <select value={nf.status} onChange={e => setNf({ ...nf, status: e.target.value })}><option value="">Any status</option>{ST.map(x => <option key={x}>{x}</option>)}</select></div>
      {rows.map(n => <div key={n.id} className="card" style={{ marginBottom: 10, borderLeft: `5px solid ${n.status === 'New' ? 'var(--red)' : n.status === 'Resolved' ? '#2e9d5b' : 'var(--btn)'}` }}>
        <div className="mu">{new Date(n.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · <b>{MIN[n.ministry]} Ministry</b>{n.topic && ` · ${n.topic}`}{n.asm && ` · ${n.asm}`}</div>
        <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>{n.message}</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><select value={n.status} onChange={e => setStatus(n, e.target.value)} style={{ width: 'auto' }}>{ST.map(x => <option key={x}>{x}</option>)}</select>
          {sup && <button className="btn g" onClick={() => del(n)}>Delete</button>}</div>
      </div>)}
      {!rows.length && <p className="mu">No messages yet.</p>}
    </div>
  )
}
