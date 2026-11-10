'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
const KINDS = [
  { k: 'photo', l: 'Pictures', name: 'Caption (optional)', pic: 'Pictures (you can choose several) *', date: 'Date taken', many: true },
  { k: 'goal', l: 'Our goals', name: 'Goal *', detail: 'More about it', pic: 'Picture (optional)', date: 'Target date (optional)' },
  { k: 'achievement', l: 'What we achieved', name: 'What we achieved *', detail: 'More about it', pic: 'Picture (optional)', date: 'When' },
]
// National admin: add to and delete from the church gallery page (/gallery). upload and path come from the admin page.
export default function GalleryAdmin({ upload, path }) {
  const [items, setItems] = useState([]), [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  const load = async () => setItems((await db.from('gallery').select('*').order('created_at', { ascending: false })).data || [])
  useEffect(() => { load() }, [])
  async function add(e, kind) {
    e.preventDefault(); const form = e.target, f = new FormData(form)
    const files = f.getAll('photo').filter(x => x.size)
    if (kind.many && !files.length) return setMsg('Choose at least one picture.')
    const base = { kind: kind.k, title: f.get('title').trim() || null, detail: f.get('detail') || null, date: f.get('date') || null }
    setBusy(true); setMsg('')
    const rows = []
    try {
      for (const file of files.length ? files : [null]) rows.push({ ...base, image_url: file ? (await upload(file)).media_url : null })
      const { error } = await db.from('gallery').insert(rows)
      if (error) throw new Error(error.message.includes('gallery') ? 'Run supabase/gallery.sql in Supabase first, then try again.' : error.message)
      form.reset(); setMsg('Saved. It shows on the gallery page within a minute.'); load()
    } catch (err) {
      await db.storage.from('team').remove(rows.map(r => path(r.image_url)).filter(Boolean)) // nothing saved, so don't leave the uploads behind
      setMsg(err.message)
    }
    setBusy(false)
  }
  async function del(x) {
    if (!confirm(`Delete ${x.title ? `"${x.title}"` : 'this picture'}?`)) return
    const { error } = await db.from('gallery').delete().eq('id', x.id)
    if (error) return setMsg(error.message)
    if (path(x.image_url)) await db.storage.from('team').remove([path(x.image_url)])
    setItems(items.filter(i => i.id !== x.id))
  }
  return (<>
    <p className="mu" style={{ marginTop: 0 }}>Everything here shows on the <a href="/gallery" target="_blank">Church Gallery page</a>.</p>
    {msg && <p><b>{msg}</b></p>}
    {KINDS.map(kind => {
      const rows = items.filter(x => x.kind === kind.k)
      return <details key={kind.k} className="card" style={{ marginBottom: 10 }}><summary><b>{kind.l}</b> ({rows.length})</summary>
        <form onSubmit={e => add(e, kind)} style={{ marginTop: 10 }}><div className="form">
          <div><label>{kind.name}</label><input name="title" required={!kind.many} /></div>
          {kind.detail && <div><label>{kind.detail}</label><textarea name="detail" rows={2} /></div>}
          <div><label>{kind.date}</label><input name="date" type="date" /></div>
          <div><label>{kind.pic}</label><input name="photo" type="file" accept="image/*" multiple={kind.many} /></div></div>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Add'}</button></form>
        {kind.many ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>{rows.map(x => <div key={x.id} style={{ width: 110 }}>
          <img src={x.image_url} alt="" style={{ width: 110, height: 82, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          {x.title && <div className="mu" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.title}</div>}
          <button className="btn g del" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del(x)}>Delete</button></div>)}</div>
          : rows.map(x => <div key={x.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
            {x.image_url && <img src={x.image_url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />}
            <div style={{ flex: 1, minWidth: 0 }}><b>{x.title}</b><div className="mu">{[x.date, x.detail].filter(Boolean).join(' · ')}</div></div>
            <button className="btn g del" onClick={() => del(x)}>Delete</button></div>)}
      </details>
    })}
  </>)
}
