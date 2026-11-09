'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
const KINDS = [['church', 'Pictures of the church'], ['sunday', 'A normal Sunday']]
const setupMsg = m => m.includes('cover_url') ? 'Run supabase/assembly-cover.sql in Supabase first, then try again.' : m.includes('assembly_') ? 'Run supabase/assembly-pages.sql in Supabase first, then try again.' : m
// Location, service time and pictures for one assembly's page. upload and path come from the admin page.
export default function AssemblyInfoAdmin({ asm, prov, upload, path }) {
  const [info, setInfo] = useState(null), [photos, setPhotos] = useState([]), [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  const load = async () => {
    const [i, p] = await Promise.all([db.from('assembly_info').select('*').eq('asm', asm).maybeSingle(), db.from('assembly_photos').select('*').eq('asm', asm).order('created_at')])
    setInfo(i.data || {}); setPhotos(p.data || [])
  }
  useEffect(() => { load() }, [])
  async function saveInfo(e) {
    e.preventDefault(); const f = new FormData(e.target)
    const { error } = await db.from('assembly_info').upsert({ asm, prov, address: f.get('address') || null, map_link: f.get('map_link') || null, service_time: f.get('service_time') || null, updated_at: new Date().toISOString() })
    setMsg(error ? setupMsg(error.message) : 'Location saved. The page updates within a minute.')
  }
  // the picture on this assembly's card in the homepage strip; replacing or removing it deletes the old file
  async function setCover(e) {
    e.preventDefault(); const form = e.target, file = new FormData(form).get('cover')
    if (!file?.size) return setMsg('Choose a picture first.')
    setBusy(true); setMsg(''); let url
    try {
      url = (await upload(file)).media_url
      const { error } = await db.from('assembly_info').upsert({ asm, prov, cover_url: url, updated_at: new Date().toISOString() })
      if (error) throw new Error(setupMsg(error.message))
      if (path(info.cover_url)) await db.storage.from('team').remove([path(info.cover_url)])
      setInfo({ ...info, cover_url: url }); form.reset(); setMsg('Card picture saved. The homepage updates within a minute.')
    } catch (err) {
      if (path(url)) await db.storage.from('team').remove([path(url)])
      setMsg(err.message)
    }
    setBusy(false)
  }
  async function removeCover() {
    if (!confirm('Remove the card picture?')) return
    const { error } = await db.from('assembly_info').update({ cover_url: null }).eq('asm', asm)
    if (error) return setMsg(setupMsg(error.message))
    if (path(info.cover_url)) await db.storage.from('team').remove([path(info.cover_url)])
    setInfo({ ...info, cover_url: null }); setMsg('Card picture removed.')
  }
  async function addPhotos(e, kind) {
    e.preventDefault(); const form = e.target, f = new FormData(form)
    const files = f.getAll('photo').filter(x => x.size)
    if (!files.length) return setMsg('Choose at least one picture.')
    setBusy(true); setMsg('')
    const rows = []
    try {
      for (const file of files) rows.push({ asm, prov, kind, caption: f.get('caption') || null, image_url: (await upload(file)).media_url })
      const { error } = await db.from('assembly_photos').insert(rows)
      if (error) throw new Error(setupMsg(error.message))
      form.reset(); setMsg(`${rows.length} picture${rows.length > 1 ? 's' : ''} added.`); load()
    } catch (err) {
      await db.storage.from('team').remove(rows.map(r => path(r.image_url)).filter(Boolean)) // nothing saved, so don't leave the uploads behind
      setMsg(err.message)
    }
    setBusy(false)
  }
  async function del(x) {
    if (!confirm('Delete this picture?')) return
    const { error } = await db.from('assembly_photos').delete().eq('id', x.id)
    if (error) return setMsg(error.message)
    if (path(x.image_url)) await db.storage.from('team').remove([path(x.image_url)])
    setPhotos(photos.filter(p => p.id !== x.id))
  }
  if (!info) return <p className="mu">Loading…</p>
  const cover = photos.find(p => p.kind === 'church')?.image_url
  return (<>
    <h3 style={{ marginTop: 28 }}>Location and pictures of {asm}</h3>
    {msg && <p><b>{msg}</b></p>}
    <form className="card" onSubmit={setCover} style={{ marginBottom: 10 }}>
      <b>Assembly card picture</b>
      <p className="mu" style={{ marginTop: 4 }}>The picture on {asm}'s card in the moving Assemblies strip on the homepage.{!info.cover_url && ' Until you add one, the card uses the first church picture below, or the church logo.'}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        {(info.cover_url || cover) ? <img src={info.cover_url || cover} alt="" style={{ width: 160, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          : <span className="asm-ph" style={{ width: 160, borderRadius: 10 }}><img src="/logo.png" alt="" /></span>}
        <div style={{ flex: 1, minWidth: 200 }}><label>{info.cover_url ? 'Change the picture' : 'Choose a picture'}</label><input name="cover" type="file" accept="image/*" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Save card picture'}</button>
            {info.cover_url && <button type="button" className="btn g del" disabled={busy} onClick={removeCover}>Remove</button>}</div></div>
      </div></form>
    <form className="card" onSubmit={saveInfo}><div className="form">
      <div><label>Where is the assembly? (address)</label><input name="address" defaultValue={info.address ?? ''} placeholder="e.g. 123 Main Road, Budiriro 2, Harare" /></div>
      <div><label>Google Maps link (optional)</label><input name="map_link" type="url" defaultValue={info.map_link ?? ''} placeholder="Paste the Share link from Google Maps" /></div>
      <div><label>Sunday service time</label><input name="service_time" defaultValue={info.service_time ?? ''} placeholder="e.g. Sundays 9:00am – 1:00pm" /></div></div>
      <button className="btn">Save location</button></form>
    {KINDS.map(([kind, label]) => {
      const rows = photos.filter(p => p.kind === kind)
      return <details key={kind} className="card" style={{ marginTop: 10 }}><summary><b>{label}</b> ({rows.length})</summary>
        <form onSubmit={e => addPhotos(e, kind)} style={{ marginTop: 10 }}><div className="form">
          <div><label>Pictures (you can choose several)</label><input name="photo" type="file" accept="image/*" multiple /></div>
          <div><label>Caption (optional)</label><input name="caption" /></div></div>
          <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Add pictures'}</button></form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>{rows.map(x => <div key={x.id} style={{ width: 110 }}>
          <img src={x.image_url} alt="" style={{ width: 110, height: 82, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          <button className="btn g del" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del(x)}>Delete</button></div>)}</div>
      </details>
    })}
  </>)
}
