'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
// National admin: the pictures behind the homepage banner, stored as the content row 'hero' (one picture link per line)
export default function HeroAdmin({ upload, path }) {
  const [pics, setPics] = useState(null), [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  useEffect(() => { db.from('content').select('body').eq('key', 'hero').maybeSingle().then(({ data }) => setPics((data?.body || '').split('\n').filter(Boolean))) }, [])
  const save = async list => {
    const { error } = await db.from('content').upsert({ key: 'hero', title: 'Banner pictures', body: list.join('\n') || null, updated_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
    setPics(list)
  }
  async function add(e) {
    e.preventDefault(); const form = e.target, files = new FormData(form).getAll('photo').filter(x => x.size)
    if (!files.length) return setMsg('Choose at least one picture.')
    setBusy(true); setMsg(''); const urls = []
    try {
      for (const file of files) urls.push((await upload(file)).media_url)
      await save([...pics, ...urls]); form.reset(); setMsg('Saved. The banner changes within a minute.')
    } catch (err) {
      await db.storage.from('team').remove(urls.map(path).filter(Boolean)) // nothing saved, so don't leave the uploads behind
      setMsg(err.message)
    }
    setBusy(false)
  }
  async function del(url) {
    if (!confirm('Remove this picture from the banner?')) return
    try { await save(pics.filter(p => p !== url)); if (path(url)) await db.storage.from('team').remove([path(url)]); setMsg('Picture removed.') } catch (err) { setMsg(err.message) }
  }
  async function first(url) {
    try { await save([url, ...pics.filter(p => p !== url)]); setMsg('That picture now shows first.') } catch (err) { setMsg(err.message) }
  }
  if (!pics) return <p className="mu">Loading…</p>
  return (
    <div className="card">
      <p className="mu" style={{ marginTop: 0 }}>These pictures fill the big banner at the top of the homepage, fading from one to the next, with the church name on top. Wide (landscape) pictures look best.{!pics.length && ' Until you add some, the banner uses the current church picture.'}</p>
      {msg && <p><b>{msg}</b></p>}
      <form onSubmit={add}><div className="form"><div><label>Pictures (you can choose several)</label><input name="photo" type="file" accept="image/*" multiple /></div></div>
        <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Add to banner'}</button></form>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>{pics.map((p, i) => <div key={p} style={{ width: 160 }}>
        <img src={p} alt="" style={{ width: 160, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {i > 0 && <button className="btn g" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => first(p)}>Show first</button>}
          <button className="btn g del" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del(p)}>Remove</button></div></div>)}</div>
    </div>
  )
}
