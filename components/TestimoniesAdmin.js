'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES } from '@/lib/assemblies'
const setupMsg = m => m.includes('testimonies') ? 'Run supabase/testimonies.sql in Supabase first, then try again.' : m
// National admin: read testimonies sent from the site, publish or delete them, or add one yourself
export default function TestimoniesAdmin({ upload, path }) {
  const [rows, setRows] = useState(null), [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  const load = async () => {
    const { data, error } = await db.from('testimonies').select('*').order('created_at', { ascending: false })
    if (error) setMsg(setupMsg(error.message))
    setRows(data || [])
  }
  useEffect(() => { load() }, [])
  async function setPublished(x, published) {
    const { error } = await db.from('testimonies').update({ published }).eq('id', x.id)
    if (error) return setMsg(error.message)
    setRows(rows.map(r => r.id === x.id ? { ...r, published } : r)); setMsg(published ? 'Published. It shows on the site within a minute.' : 'Hidden from the site.')
  }
  async function del(x) {
    if (!confirm('Delete this testimony?')) return
    const { error } = await db.from('testimonies').delete().eq('id', x.id)
    if (error) return setMsg(error.message)
    if (path(x.image_url)) await db.storage.from('team').remove([path(x.image_url)])
    setRows(rows.filter(r => r.id !== x.id))
  }
  async function add(e) {
    e.preventDefault(); const form = e.target, f = new FormData(form), file = f.get('photo')
    setBusy(true); setMsg(''); let image_url = null
    try {
      if (file?.size) image_url = (await upload(file)).media_url
      const { error } = await db.from('testimonies').insert({ name: f.get('name').trim() || null, asm: f.get('asm') || null, title: f.get('title').trim() || null, body: f.get('body').trim(), image_url, published: true })
      if (error) throw new Error(setupMsg(error.message))
      form.reset(); setMsg('Testimony added and published.'); load()
    } catch (err) {
      if (path(image_url)) await db.storage.from('team').remove([path(image_url)])
      setMsg(err.message)
    }
    setBusy(false)
  }
  if (!rows) return <p className="mu">Loading…</p>
  const waiting = rows.filter(r => !r.published), shown = rows.filter(r => r.published)
  const Row = ({ x }) => <div className="card" style={{ marginBottom: 10, borderLeft: `5px solid ${x.published ? '#1f9d55' : 'var(--red)'}` }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {x.image_url && <img src={x.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
      <div style={{ flex: 1, minWidth: 0 }}><b>{x.title || 'Testimony'}</b><div className="mu">{[x.name || 'Anonymous', x.asm, x.created_at.slice(0, 10)].filter(Boolean).join(' · ')}</div>
        <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>{x.body}</p>
        <button className="btn" onClick={() => setPublished(x, !x.published)}>{x.published ? 'Hide from site' : 'Publish'}</button>
        <button className="btn g del" onClick={() => del(x)}>Delete</button></div></div></div>
  return (<>
    <p className="mu" style={{ marginTop: 0 }}>Testimonies sent from the <a href="/testimonies" target="_blank">Testimonies page</a> wait here until you publish them.</p>
    {msg && <p><b>{msg}</b></p>}
    <h3>Waiting to be read ({waiting.length})</h3>
    {waiting.length ? waiting.map(x => <Row key={x.id} x={x} />) : <p className="mu">Nothing waiting.</p>}
    <details className="card" style={{ margin: '16px 0' }}><summary><b>Add a testimony yourself</b></summary>
      <form onSubmit={add} style={{ marginTop: 10 }}><div className="form">
        <div><label>Name (empty = anonymous)</label><input name="name" /></div>
        <div><label>Assembly</label><select name="asm"><option value=""></option>{Object.entries(ASSEMBLIES).map(([p, a]) => <optgroup key={p} label={p}>{a.map(x => <option key={x}>{x}</option>)}</optgroup>)}</select></div>
        <div><label>Title</label><input name="title" /></div>
        <div><label>Picture (optional)</label><input name="photo" type="file" accept="image/*" /></div>
        <div style={{ gridColumn: '1/-1' }}><label>Testimony *</label><textarea name="body" required rows={5} /></div></div>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Add and publish'}</button></form></details>
    <h3>On the site ({shown.length})</h3>
    {shown.length ? shown.map(x => <Row key={x.id} x={x} />) : <p className="mu">None published yet.</p>}
  </>)
}
