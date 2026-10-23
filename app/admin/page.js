'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES, BISHOP, PROV, provOf, sameAsm, slug } from '@/lib/assemblies'
import Person from '@/components/Person'
import { withDefaults, MINISTRIES, NO_PIC, defaultPic } from '@/lib/content'
const ROLES = ['Bishop', 'Overseer', 'Secretary', 'Treasurer', 'Administrator', 'Assembly Pastor']
const ORD = r => (ROLES.indexOf(r) < 0 ? 9 : ROLES.indexOf(r))
const grp = m => {
  const a = m.dob ? Math.floor((Date.now() - new Date(m.dob)) / 31557600000) : null
  if (a !== null && a < 13) return 'sunday'
  if (a !== null && a < 36) return 'youth'
  return m.gender === 'Female' ? 'women' : m.gender === 'Male' ? 'men' : 'other'
}
const F = ({ l, ...p }) => <div><label>{l}</label><input {...p} /></div>
const goTo = id => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
export default function Admin() {
  const [me, setMe] = useState(null), [ready, setReady] = useState(false), [members, setMembers] = useState([])
  const [q, setQ] = useState(''), [present, setPresent] = useState(new Set()), [msg, setMsg] = useState(''), [team, setTeam] = useState([])
  const [events, setEvents] = useState([]), [selAsm, setSelAsm] = useState(new Set()), [open, setOpen] = useState(null), [marks, setMarks] = useState({})
  const [asmSel, setAsmSel] = useState(''), [editM, setEditM] = useState(null), [editT, setEditT] = useState(null), [busy, setBusy] = useState(false), [content, setContent] = useState(withDefaults([]))
  const [gifts, setGifts] = useState([]), [gf, setGf] = useState({ kind: '', dest: '', status: '' })
  const load = useCallback(async () => {
    const { data: { user } } = await db.auth.getUser()
    if (user) {
      const { data: s } = await db.from('staff').select('*').eq('user_id', user.id).maybeSingle()
      setMe(s)
      if (s) setMembers((await db.from('members').select('*').order('name')).data || [])
      if (s) setEvents(((await db.from('events').select('*').order('date', { ascending: false })).data || []).filter(x => s.role === 'super' || x.prov === s.province))
      if (s) setGifts((await db.from('giving').select('*').order('created_at', { ascending: false })).data || [])
      if (s?.role === 'super') setContent(withDefaults((await db.from('content').select('*')).data))
      if (s) setTeam(((await db.from('team').select('*').order('name')).data || []).filter(x => s.role === 'super' || x.prov === s.province))
    }
    setReady(true)
  }, [])
  useEffect(() => { load() }, [load])
  const prov = me?.role === 'province' ? me.province : null
  const provSel = (d = '') => prov ? null : <div><label>Province</label><select name="prov" defaultValue={d}>{PROV.map(p => <option key={p}>{p}</option>)}</select></div>
  async function login(e) {
    e.preventDefault(); const f = new FormData(e.target)
    const { error } = await db.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') })
    error ? setMsg(error.message) : load()
  }
  // ---- congregants ----
  const memberFields = (m = {}) => {
    const d = k => m[k] ?? ''
    return <div className="form">
      <F l="Full name *" name="name" required defaultValue={d('name')} /><F l="Phone" name="phone" defaultValue={d('phone')} /><F l="Email" name="email" defaultValue={d('email')} />
      <div><label>Gender</label><select name="gender" defaultValue={d('gender')}><option></option><option>Male</option><option>Female</option></select></div>
      <F l="Date of birth" name="dob" type="date" defaultValue={d('dob')} /><F l="Address" name="addr" defaultValue={d('addr')} />
      <F l="Assembly *" name="asm" list="asms" required defaultValue={d('asm')} />{provSel(m.prov || provOf(m.asm) || PROV[0])}
      <div><label>Status</label><select name="status" defaultValue={m.status || 'Member'}><option>Member</option><option>Visitor</option><option>New Convert</option><option>Inactive</option></select></div>
      <F l="Ministry" name="ministry" defaultValue={d('ministry')} /><div><label>Baptised?</label><select name="baptised" defaultValue={m.baptised ? 'Yes' : 'No'}><option>No</option><option>Yes</option></select></div>
      <F l="Next of kin" name="kin" defaultValue={d('kin')} /><F l="Notes" name="notes" defaultValue={d('notes')} />
    </div>
  }
  async function saveMember(e, id) {
    e.preventDefault(); const o = Object.fromEntries(new FormData(e.target))
    if (prov) o.prov = prov
    o.baptised = o.baptised === 'Yes'; if (!o.dob) o.dob = null
    const { error } = id ? await db.from('members').update(o).eq('id', id) : await db.from('members').insert(o)
    if (error) return setMsg(error.message)
    if (!id) e.target.reset()
    setEditM(null); setMsg(id ? 'Congregant updated' : 'Congregant saved'); load()
  }
  async function delMember(id) { if (confirm('Delete this congregant?')) { await db.from('members').delete().eq('id', id); setEditM(null); load() } }
  const memberEditor = at => editM?.at === at && <form id={`edit-m-${at}`} key={editM.m.id} className="card" style={{ margin: '10px 0', borderTop: '5px solid var(--blue)' }} onSubmit={e => saveMember(e, editM.m.id)}>
    <h3>Edit {editM.m.name}</h3>{memberFields(editM.m)}
    <button className="btn">Save changes</button><button type="button" className="btn g" onClick={() => setEditM(null)}>Cancel</button></form>
  const memberTable = (rows, at) => <div className="scroll" style={{ marginTop: 10 }}><table><thead><tr><th>Name</th><th>Assembly</th><th>Province</th><th>Phone</th><th>Status</th><th></th></tr></thead>
    <tbody>{rows.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.asm}</td><td>{m.prov}</td><td>{m.phone}</td><td>{m.status}</td>
      <td><button className="btn g" onClick={() => { setEditM({ m, at }); goTo(`edit-m-${at}`) }}>Edit</button><button className="btn g" onClick={() => delMember(m.id)}>Delete</button></td></tr>)}</tbody></table></div>
  // ---- leaders / team ----
  const teamFields = (x = {}) => <div className="form">
    <F l="Full name *" name="name" required defaultValue={x.name ?? ''} />
    <F l="Role *" name="role" list="roles" required defaultValue={x.role ?? ''} />
    <F l="Assembly" name="asm" list="asms" defaultValue={x.asm ?? ''} />
    {prov ? null : <div><label>Province</label><select name="prov" defaultValue={x.prov ?? ''}><option></option>{PROV.map(p => <option key={p}>{p}</option>)}</select></div>}
    <F l={x.photo_url ? 'Replace photo' : 'Photo'} name="photo" type="file" accept="image/*" />
  </div>
  const photoPath = url => url && decodeURIComponent(url.split('/object/public/team/')[1] || '')
  async function saveTeam(e, x) {
    e.preventDefault(); const f = new FormData(e.target), file = f.get('photo')
    const o = { name: f.get('name'), role: f.get('role'), asm: f.get('asm') || null, prov: prov || f.get('prov') || provOf(f.get('asm')) || null }
    setBusy(true)
    if (file && file.size) {
      const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
      const { error } = await db.storage.from('team').upload(path, file)
      if (error) { setBusy(false); return setMsg(`Photo upload failed: ${error.message}`) }
      o.photo_url = db.storage.from('team').getPublicUrl(path).data.publicUrl
    }
    const { error } = x ? await db.from('team').update(o).eq('id', x.id) : await db.from('team').insert(o)
    setBusy(false)
    if (error) return setMsg(error.message)
    if (x && o.photo_url && photoPath(x.photo_url)) await db.storage.from('team').remove([photoPath(x.photo_url)])
    e.target.reset(); setEditT(null); setMsg(x ? 'Leader updated' : 'Leader added'); load()
  }
  async function delTeam(x) {
    if (!confirm(`Remove ${x.name}?`)) return
    const { error } = await db.from('team').delete().eq('id', x.id)
    if (error) return setMsg(error.message)
    if (photoPath(x.photo_url)) await db.storage.from('team').remove([photoPath(x.photo_url)])
    setEditT(null); load()
  }
  const teamEditor = at => editT?.at === at && <form id={`edit-t-${at}`} key={editT.x.id} className="card" style={{ margin: '10px 0', borderTop: '5px solid var(--blue)' }} onSubmit={e => saveTeam(e, editT.x)}>
    <h3>Edit {editT.x.name}</h3>
    {editT.x.photo_url && <img src={editT.x.photo_url} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12 }} />}
    {teamFields(editT.x)}
    <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button><button type="button" className="btn g" onClick={() => setEditT(null)}>Cancel</button></form>
  // ---- website sections (About Us, ministries) ----
  async function saveContent(e, s) {
    e.preventDefault(); const f = new FormData(e.target), file = f.get('photo')
    const o = { key: s.key, title: f.get('title'), body: f.get('body'), leader: f.get('leader') || null, updated_at: new Date().toISOString() }
    if (f.get('pic') === 'none') o.image_url = NO_PIC
    if (f.get('pic') === 'default') o.image_url = null
    setBusy(true)
    if (file && file.size) {
      const path = `content/${s.key}-${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
      const { error } = await db.storage.from('team').upload(path, file)
      if (error) { setBusy(false); return setMsg(`Picture upload failed: ${error.message}`) }
      o.image_url = db.storage.from('team').getPublicUrl(path).data.publicUrl
    }
    const { error } = await db.from('content').upsert(o)
    setBusy(false)
    if (error) return setMsg(error.message.includes('content') ? 'Run supabase/site-content.sql in Supabase first, then try again.' : error.message)
    if (o.image_url !== undefined && photoPath(s.image_url)) await db.storage.from('team').remove([photoPath(s.image_url)])
    setMsg(`${o.title} saved — the website updates within a minute`); load()
  }
  // ---- giving (tithes, donations, pledges) ----
  async function setGiftStatus(g, status) {
    const { error } = await db.from('giving').update({ status }).eq('id', g.id)
    if (error) return setMsg(error.message)
    setGifts(gifts.map(x => x.id === g.id ? { ...x, status } : x))
  }
  async function delGift(g) { if (confirm(`Delete this ${g.kind.toLowerCase()} from ${g.name}?`)) { await db.from('giving').delete().eq('id', g.id); load() } }
  async function addGift(e) {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.target))
    const o = { kind: v.kind, name: v.name, phone: v.phone || null, who: 'Member', dest: v.dest, prov: provOf(v.dest) || null, amount: +v.amount, currency: v.currency, method: v.method || null, ref: v.ref || null, note: v.note || null }
    const { data, error } = await db.from('giving').insert(o).select().single()
    if (error) return setMsg(error.message.includes('giving') ? 'Run supabase/giving.sql in Supabase first, then try again.' : error.message)
    if (v.status !== 'Pending') await db.from('giving').update({ status: v.status }).eq('id', data.id)
    e.target.reset(); setMsg('Giving recorded'); load()
  }
  // ---- reports / events ----
  async function addReport(e) {
    e.preventDefault(); const o = Object.fromEntries(new FormData(e.target)); const p = prov || o.prov
    const ms = members.filter(m => present.has(m.id)), b = { women: 0, men: 0, youth: 0, sunday: 0 }
    ms.forEach(m => { const g = grp(m); if (b[g] != null) b[g]++ })
    const { data, error } = await db.from('reports').insert({ prov: p, asm: o.asm, date: o.date, title: o.title, preacher: o.preacher, word: o.word, count: Math.max(+o.count || 0, ms.length), ...(ms.length ? b : {}) }).select().single()
    if (error) return setMsg(error.message)
    if (ms.length) await db.from('attendance').insert(ms.map(m => ({ report_id: data.id, member_id: m.id })))
    setPresent(new Set()); e.target.reset(); setMsg('Report published')
  }
  async function addEvent(e) {
    e.preventDefault(); const o = Object.fromEntries(new FormData(e.target)); o.prov = prov || o.prov; o.asms = [...selAsm]
    const { error } = await db.from('events').insert(o)
    if (error) return setMsg(error.message)
    e.target.reset(); setSelAsm(new Set()); setMsg('Event added'); load()
  }
  const invited = ev => members.filter(m => ev.asms?.length ? ev.asms.includes(m.asm) : !ev.prov || m.prov === ev.prov)
  async function openAtt(ev) {
    if (open === ev.id) return setOpen(null)
    const { data } = await db.from('event_attendance').select('member_id,status').eq('event_id', ev.id)
    setMarks(Object.fromEntries((data || []).map(r => [r.member_id, r.status]))); setOpen(ev.id)
  }
  async function saveAtt(ev) {
    const all = Object.entries(marks), set = all.filter(([, s]) => s).map(([member_id, status]) => ({ event_id: ev.id, member_id, status }))
    const cleared = all.filter(([, s]) => !s).map(([id]) => id)
    if (set.length) { const { error } = await db.from('event_attendance').upsert(set); if (error) return setMsg(error.message) }
    if (cleared.length) await db.from('event_attendance').delete().eq('event_id', ev.id).in('member_id', cleared)
    setMsg(`Attendance saved for ${ev.title}`)
  }
  if (!ready) return <p style={{ padding: 20 }}>Loading…</p>
  if (!me) return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}><h2 style={{ marginTop: 0 }}>Admin login</h2>
      <form className="card" onSubmit={login}><F l="Email" name="email" type="email" required /><br /><F l="Password" name="password" type="password" required /><br />
        <button className="btn">Sign in</button><p className="mu">{msg || 'Sign in with the account your national admin created for you.'}</p></form></div>
  )
  const assemblies = [...new Set([...(prov ? ASSEMBLIES[prov] || [] : Object.values(ASSEMBLIES).flat()), ...members.map(m => m.asm).filter(Boolean)])].sort()
  const list = members.filter(m => !q || `${m.name} ${m.phone} ${m.asm}`.toLowerCase().includes(q.toLowerCase()))
  const aMembers = asmSel ? members.filter(m => sameAsm(m.asm, asmSel)) : []
  const aLeaders = asmSel ? team.filter(x => sameAsm(x.asm, asmSel)).sort((a, c) => ORD(a.role) - ORD(c.role)) : []
  return (
    <div className="wrap" style={{ paddingTop: 20 }}>
      <datalist id="asms">{assemblies.map(a => <option key={a} value={a} />)}</datalist>
      <datalist id="roles">{ROLES.map(r => <option key={r} value={r} />)}</datalist>
      <p><a href="/">← Home</a> · {prov ? `${prov} admin` : 'National admin'} · <button className="btn g" onClick={async () => { await db.auth.signOut(); setMe(null) }}>Sign out</button> <b>{msg}</b></p>
      <div className="grid stats">{[['Congregants', members.length], ['Members', members.filter(m => m.status === 'Member').length], ['Visitors', members.filter(m => m.status === 'Visitor').length]].map(([l, n]) => <div className="stat" key={l}><b>{n}</b>{l}</div>)}</div>

      {me.role === 'super' && <>
        <h2>Website content</h2>
        <p className="mu" style={{ textAlign: 'center' }}>Change the About Us, ministry (Men’s, Women’s, Youth, Children’s) and “How to pay” sections on the homepage. Leave a blank line between paragraphs. Put your EcoCash / bank details in “How to pay”.</p>
        {content.map(s => <details key={s.key + (s.updated_at || '')} className="card" style={{ marginBottom: 10 }}><summary><b>{s.title}</b></summary>
          <form onSubmit={e => saveContent(e, s)}>
            <div className="form"><F l="Heading *" name="title" required defaultValue={s.title} />{MINISTRIES.includes(s.key) && <F l="Led by (optional)" name="leader" defaultValue={s.leader ?? ''} />}
              {s.key !== 'giving' && <F l={s.image_url ? 'Upload a new picture' : 'Upload a picture (optional)'} name="photo" type="file" accept="image/*" />}
              {s.key !== 'giving' && <div><label>Picture</label><select name="pic" defaultValue="keep">
                <option value="keep">{s.image_url ? 'Keep the current picture' : 'No picture (keep it that way)'}</option>
                {defaultPic(s.key) && s.image_url !== defaultPic(s.key) && <option value="default">Use the default illustration</option>}
                {s.image_url && <option value="none">Remove the picture — show no picture</option>}</select></div>}</div>
            {s.key !== 'giving' && <div style={{ marginBottom: 10 }}>{s.image_url ? <img src={s.image_url} alt="" style={{ width: 120, height: 75, objectFit: 'cover', borderRadius: 8 }} /> : <span className="mu">Currently showing no picture.</span>}</div>}
            <label>Text</label><textarea name="body" rows="7" defaultValue={s.body ?? ''} />
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : `Save ${s.title}`}</button>
          </form></details>)}
      </>}

      <h2>Giving</h2>
      {(() => {
        const dests = prov ? ASSEMBLIES[prov] : [BISHOP, ...Object.values(ASSEMBLIES).flat()]
        const rows = gifts.filter(g => (!gf.kind || g.kind === gf.kind) && (!gf.dest || g.dest === gf.dest) && (!gf.status || g.status === gf.status))
        const tot = {}; rows.filter(g => g.status === 'Received' || g.status === 'Fulfilled').forEach(g => { tot[g.currency] = (tot[g.currency] || 0) + +g.amount })
        const owed = {}; rows.filter(g => g.kind === 'Pledge' && g.status === 'Pending').forEach(g => { owed[g.currency] = (owed[g.currency] || 0) + +g.amount })
        const fmt = o => Object.entries(o).map(([c, n]) => `${c} ${n.toFixed(2)}`).join(' · ') || '0'
        const sel = (k, opts, all) => <select value={gf[k]} onChange={e => setGf({ ...gf, [k]: e.target.value })}><option value="">{all}</option>{opts.map(o => <option key={o}>{o}</option>)}</select>
        return <>
          <div className="form">{sel('kind', ['Tithe', 'Donation', 'Pledge'], 'All types')}{sel('dest', dests, prov ? `All ${prov} assemblies` : 'All destinations')}{sel('status', ['Pending', 'Received', 'Fulfilled', 'Cancelled'], 'Any status')}</div>
          <div className="grid stats"><div className="stat"><b>{rows.length}</b>Entries</div><div className="stat"><b style={{ fontSize: 20 }}>{fmt(tot)}</b>Received</div><div className="stat"><b style={{ fontSize: 20 }}>{fmt(owed)}</b>Pledged, not yet paid</div></div>
          <div className="scroll" style={{ marginTop: 10 }}><table><thead><tr><th>Date</th><th>Type</th><th>Name</th><th>Phone</th><th>To</th><th>Amount</th><th>Method / ref</th><th>Status</th><th></th></tr></thead>
            <tbody>{rows.map(g => <tr key={g.id}><td>{g.created_at?.slice(0, 10)}</td><td>{g.kind}{g.due && <div className="mu">due {g.due}</div>}</td><td>{g.name}<div className="mu">{g.who}</div></td>
              <td>{g.phone ? <a href={`tel:${g.phone}`}>{g.phone}</a> : '—'}</td><td>{g.dest}</td><td><b>{g.currency} {(+g.amount).toFixed(2)}</b></td>
              <td>{[g.method, g.ref].filter(Boolean).join(' · ') || '—'}{g.note && <div className="mu" style={{ whiteSpace: 'normal', maxWidth: 220 }}>{g.note}</div>}</td>
              <td><select value={g.status} onChange={e => setGiftStatus(g, e.target.value)} style={{ width: 'auto' }}>{['Pending', 'Received', 'Fulfilled', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select></td>
              <td>{me.role === 'super' && <button className="btn g" onClick={() => delGift(g)}>Delete</button>}</td></tr>)}</tbody></table>
            {!rows.length && <p className="mu">No giving recorded yet.</p>}</div>
          <details className="card" style={{ marginTop: 12 }}><summary><b>+ Record giving received at church (e.g. cash)</b></summary>
            <form onSubmit={addGift}><div className="form">
              <div><label>Type</label><select name="kind"><option>Tithe</option><option>Donation</option><option>Pledge</option></select></div>
              <div><label>To *</label><select name="dest" required>{dests.map(d => <option key={d}>{d}</option>)}</select></div>
              <F l="Name *" name="name" required /><F l="Phone" name="phone" />
              <div><label>Currency</label><select name="currency"><option>USD</option><option>ZiG</option><option>MZN</option><option>ZAR</option></select></div>
              <F l="Amount *" name="amount" type="number" min="0.01" step="0.01" required />
              <div><label>Method</label><select name="method"><option>Cash</option><option>EcoCash</option><option>InnBucks</option><option>OneMoney</option><option>M-Pesa</option><option>Bank transfer</option></select></div>
              <F l="Reference" name="ref" /><F l="Note" name="note" />
              <div><label>Status</label><select name="status" defaultValue="Received"><option>Received</option><option>Pending</option><option>Fulfilled</option></select></div>
            </div><button className="btn">Save</button></form></details>
        </>
      })()}

      <h2>Manage an assembly</h2>
      <div className="card"><label>Choose an assembly</label>
        <select value={asmSel} onChange={e => { setAsmSel(e.target.value); setEditM(null); setEditT(null) }}><option value="">— Select —</option>
          {(prov ? [prov] : PROV).map(p => <optgroup key={p} label={p}>{ASSEMBLIES[p].map(a => <option key={a}>{a}</option>)}</optgroup>)}</select>
        {asmSel && <p className="mu" style={{ marginBottom: 0 }}>{provOf(asmSel)} · {aLeaders.length} leaders · {aMembers.length} congregants · <a href={`/assembly/${slug(asmSel)}`} target="_blank" rel="noopener noreferrer">View public page ↗</a></p>}
      </div>
      {asmSel && <>
        <h3 style={{ marginTop: 28 }}>Leaders of {asmSel}</h3>
        {teamEditor('asm')}
        {aLeaders.length ? <div className="grid people">{aLeaders.map(x => <div key={x.id}><Person x={x} />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 4 }}><button className="btn g" onClick={() => { setEditT({ x, at: 'asm' }); goTo('edit-t-asm') }}>Edit / photo</button><button className="btn g" onClick={() => delTeam(x)}>Remove</button></div></div>)}</div>
          : <p className="mu">No leaders yet.</p>}
        <details className="card" style={{ marginTop: 12 }}><summary><b>+ Add a leader to {asmSel}</b></summary>
          <form key={`t-${asmSel}`} onSubmit={e => saveTeam(e)}>{teamFields({ asm: asmSel, prov: provOf(asmSel), role: 'Assembly Pastor' })}
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Add leader'}</button></form></details>

        <h3 style={{ marginTop: 28 }}>Congregants of {asmSel}</h3>
        {memberEditor('asm')}
        {aMembers.length ? memberTable(aMembers, 'asm') : <p className="mu">No congregants yet.</p>}
        <details className="card" style={{ marginTop: 12 }}><summary><b>+ Add a congregant to {asmSel}</b></summary>
          <form key={`m-${asmSel}`} onSubmit={e => saveMember(e)}>{memberFields({ asm: asmSel, prov: provOf(asmSel) })}<button className="btn">Save congregant</button></form></details>
      </>}

      <h2>Add congregant</h2>
      <form className="card" onSubmit={e => saveMember(e)}>{memberFields()}<button className="btn">Save congregant</button></form>
      <h2>All congregants</h2>
      <input placeholder="Search name, phone, assembly…" value={q} onChange={e => setQ(e.target.value)} />
      {memberEditor('all')}
      {memberTable(list, 'all')}
      <h2>Service / Big Sunday report</h2>
      <form className="card" onSubmit={addReport}><div className="form">
        {provSel()}<F l="Assembly / venue" name="asm" list="asms" /><F l="Date *" name="date" type="date" required /><F l="Total attendance (min = ticked)" name="count" type="number" min="0" />
        <F l="Preacher" name="preacher" /><F l="Title / scripture" name="title" /></div>
        <label>The word (summary)</label><textarea name="word" rows="3" />
        <details style={{ margin: '10px 0' }}><summary>Mark who attended ({present.size})</summary>
          <div style={{ maxHeight: 280, overflow: 'auto' }}>{list.map(m => <label key={m.id} style={{ display: 'flex', gap: 8, padding: 4, color: 'var(--tx)' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={present.has(m.id)} onChange={e => { const s = new Set(present); e.target.checked ? s.add(m.id) : s.delete(m.id); setPresent(s) }} />{m.name} <span className="mu">{m.asm}</span></label>)}</div></details>
        <button className="btn">Publish report</button></form>
      <h2>Add event</h2>
      <form className="card" onSubmit={addEvent}><div className="form"><F l="Title *" name="title" required /><F l="Date *" name="date" type="date" required /><F l="Time" name="time" type="time" /><F l="Venue" name="venue" />{provSel()}</div>
        <label>Assemblies involved ({selAsm.size ? `${selAsm.size} selected` : 'none selected = all'})</label>
        {assemblies.length ? <div style={{ maxHeight: 220, overflow: 'auto', margin: '6px 0 10px' }}>
          <label style={{ display: 'flex', gap: 8, padding: 4, color: 'var(--tx)' }}><input type="checkbox" style={{ width: 'auto' }} checked={selAsm.size === assemblies.length} onChange={e => setSelAsm(e.target.checked ? new Set(assemblies) : new Set())} /><b>Select all</b></label>
          {assemblies.map(a => <label key={a} style={{ display: 'flex', gap: 8, padding: 4, color: 'var(--tx)' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={selAsm.has(a)} onChange={e => { const s = new Set(selAsm); e.target.checked ? s.add(a) : s.delete(a); setSelAsm(s) }} />{a}</label>)}
        </div> : <p className="mu">No assemblies for this province yet.</p>}
        <button className="btn">Add event</button></form>
      <h2>Events &amp; attendance</h2>
      {events.map(ev => {
        const ppl = invited(ev), n = s => ppl.filter(m => marks[m.id] === s).length
        return <div className="card" key={ev.id} style={{ marginBottom: 12, borderTop: '5px solid var(--red)' }}>
          <h3>{ev.title}</h3>
          <div className="mu">{[ev.date, ev.time, ev.venue, ev.prov].filter(Boolean).join(' · ')}<br />Assemblies: {ev.asms?.length ? ev.asms.join(', ') : 'All'}</div>
          <button className="btn g" onClick={() => openAtt(ev)}>{open === ev.id ? 'Close' : 'Mark attendance'}</button>
          {open === ev.id && <>
            <p><b>Present {n('Present')}</b> · Absent {n('Absent')} · Not marked {ppl.length - n('Present') - n('Absent')}</p>
            <div className="scroll"><table><thead><tr><th>Name</th><th>Assembly</th><th>Attendance</th></tr></thead>
              <tbody>{ppl.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.asm}</td><td>
                <select value={marks[m.id] || ''} onChange={e => setMarks({ ...marks, [m.id]: e.target.value })} style={{ width: 'auto' }}>
                  <option value="">— Not marked —</option><option>Present</option><option>Absent</option></select></td></tr>)}</tbody></table></div>
            {!ppl.length && <p className="mu">No congregants in the selected assemblies.</p>}
            <button className="btn" onClick={() => saveAtt(ev)}>Save attendance</button>
          </>}
        </div>
      })}
      {!events.length && <p className="mu">No events yet.</p>}
      {me.role === 'super' && <>
        <h2>Meet the Team</h2>
        <form className="card" onSubmit={e => saveTeam(e)}>{teamFields()}<button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Add team member'}</button></form>
        {teamEditor('all')}
        <div className="scroll" style={{ marginTop: 10 }}><table><thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>Assembly</th><th>Province</th><th></th></tr></thead>
          <tbody>{team.map(x => <tr key={x.id}><td>{x.photo_url && <img src={x.photo_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} />}</td><td>{x.name}</td><td>{x.role}</td><td>{x.asm}</td><td>{x.prov}</td>
            <td><button className="btn g" onClick={() => { setEditT({ x, at: 'all' }); goTo('edit-t-all') }}>Edit</button><button className="btn g" onClick={() => delTeam(x)}>Remove</button></td></tr>)}</tbody></table></div>
      </>}
    </div>
  )
}
