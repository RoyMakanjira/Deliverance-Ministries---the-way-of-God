'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
const KINDS = [
  { k: 'recent', l: 'Recent events', name: 'Event name', detail: 'Short description', pic: 'Pictures (you can choose several)', date: true, many: true },
  { k: 'upcoming', l: 'Upcoming events', name: 'Event name', detail: 'Venue / details', pic: 'Poster', date: true },
  { k: 'leader', l: 'Leadership', name: 'Name', detail: 'Role', pic: 'Photo' },
  { k: 'program', l: 'Programs', name: 'Program name', detail: 'When / what it is', pic: 'Picture' },
]
// National admin: manage the picture sections of a ministry page. upload and path come from the admin page.
export default function MinistryItemsAdmin({ ministry, upload, path }) {
  const [items, setItems] = useState([]), [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  const load = async () => setItems((await db.from('ministry_items').select('*').eq('ministry', ministry).order('created_at', { ascending: false })).data || [])
  useEffect(() => { load() }, [])
  async function add(e, kind) {
    e.preventDefault(); const form = e.target, f = new FormData(form)
    const files = f.getAll('photo').filter(x => x.size)
    if (kind.many && !files.length) return setMsg('Choose at least one picture.')
    const base = { ministry, kind: kind.k, title: f.get('title').trim(), detail: f.get('detail') || null, date: f.get('date') || null }
    setBusy(true); setMsg('')
    const rows = []
    try {
      for (const file of files.length ? files : [null]) rows.push({ ...base, image_url: file ? (await upload(file)).media_url : null })
      const { error } = await db.from('ministry_items').insert(rows)
      if (error) throw new Error(error.message.includes('ministry_items') ? 'Run supabase/ministry-items.sql in Supabase first, then try again.' : error.message)
      form.reset(); setMsg('Saved. It will show on the page within a minute.'); load()
    } catch (err) {
      await db.storage.from('team').remove(rows.map(r => path(r.image_url)).filter(Boolean)) // nothing saved, so don't leave the uploads behind
      setMsg(err.message)
    }
    setBusy(false)
  }
  async function del(x) {
    if (!confirm(`Delete "${x.title}"?`)) return
    const { error } = await db.from('ministry_items').delete().eq('id', x.id)
    if (error) return setMsg(error.message)
    if (path(x.image_url)) await db.storage.from('team').remove([path(x.image_url)])
    setItems(items.filter(i => i.id !== x.id))
  }
  return (<>
    {msg && <p><b>{msg}</b></p>}
    {KINDS.map(kind => {
      const rows = items.filter(x => x.kind === kind.k)
      return <details key={kind.k} className="card" style={{ marginBottom: 10 }}><summary><b>{kind.l}</b> ({rows.length})</summary>
        <form onSubmit={e => add(e, kind)} style={{ marginTop: 10 }}><div className="form">
          <div><label>{kind.name} *</label><input name="title" required /></div>
          <div><label>{kind.detail}</label><input name="detail" /></div>
          {kind.date && <div><label>Date</label><input name="date" type="date" /></div>}
          <div><label>{kind.pic}</label><input name="photo" type="file" accept="image/*" multiple={kind.many} /></div></div>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Add'}</button></form>
        {rows.map(x => <div key={x.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
          {x.image_url && <img src={x.image_url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />}
          <div style={{ flex: 1, minWidth: 0 }}><b>{x.title}</b><div className="mu">{[x.date, x.detail].filter(Boolean).join(' · ')}</div></div>
          <button className="btn g" onClick={() => del(x)}>Delete</button></div>)}
      </details>
    })}
  </>)
}
