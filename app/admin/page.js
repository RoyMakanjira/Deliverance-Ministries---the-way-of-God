'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES, PROV } from '@/lib/assemblies'
const ROLES = ['Bishop', 'Overseer', 'Secretary', 'Treasurer', 'Administrator', 'Assembly Pastor']
const grp = m => {
  const a = m.dob ? Math.floor((Date.now() - new Date(m.dob)) / 31557600000) : null
  if (a !== null && a < 13) return 'sunday'
  if (a !== null && a < 36) return 'youth'
  return m.gender === 'Female' ? 'women' : m.gender === 'Male' ? 'men' : 'other'
}
const F = ({ l, ...p }) => <div><label>{l}</label><input {...p} /></div>
export default function Admin() {
  const [me, setMe] = useState(null), [ready, setReady] = useState(false), [members, setMembers] = useState([])
  const [q, setQ] = useState(''), [present, setPresent] = useState(new Set()), [msg, setMsg] = useState(''), [team, setTeam] = useState([])
  const [events, setEvents] = useState([]), [selAsm, setSelAsm] = useState(new Set()), [open, setOpen] = useState(null), [marks, setMarks] = useState({})
  const load = useCallback(async () => {
    const { data: { user } } = await db.auth.getUser()
    if (user) {
      const { data: s } = await db.from('staff').select('*').eq('user_id', user.id).maybeSingle()
      setMe(s)
      if (s) setMembers((await db.from('members').select('*').order('name')).data || [])
      if (s) setEvents(((await db.from('events').select('*').order('date', { ascending: false })).data || []).filter(x => s.role === 'super' || x.prov === s.province))
      if (s?.role === 'super') setTeam((await db.from('team').select('*').order('name')).data || [])
    }
    setReady(true)
  }, [])
  useEffect(() => { load() }, [load])
  const prov = me?.role === 'province' ? me.province : null
  const ProvSel = () => prov ? null : <div><label>Province</label><select name="prov">{PROV.map(p => <option key={p}>{p}</option>)}</select></div>
  async function login(e) {
    e.preventDefault(); const f = new FormData(e.target)
    const { error } = await db.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') })
    error ? setMsg(error.message) : load()
  }
  async function addMember(e) {
    e.preventDefault(); const o = Object.fromEntries(new FormData(e.target))
    if (prov) o.prov = prov
    o.baptised = o.baptised === 'Yes'; if (!o.dob) o.dob = null
    const { error } = await db.from('members').insert(o)
    if (error) return setMsg(error.message)
    e.target.reset(); setMsg('Congregant saved'); load()
  }
  async function delMember(id) { if (confirm('Delete this congregant?')) { await db.from('members').delete().eq('id', id); load() } }
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
  async function addTeam(e) {
    e.preventDefault(); const f = new FormData(e.target), file = f.get('photo')
    const o = { name: f.get('name'), role: f.get('role'), asm: f.get('asm') || null, prov: f.get('prov') || null }
    if (file && file.size) {
      const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
      const { error } = await db.storage.from('team').upload(path, file)
      if (error) return setMsg(`Photo upload failed: ${error.message}`)
      o.photo_url = db.storage.from('team').getPublicUrl(path).data.publicUrl
    }
    const { error } = await db.from('team').insert(o)
    if (error) return setMsg(error.message)
    e.target.reset(); setMsg('Team member added'); load()
  }
  async function delTeam(id) { if (confirm('Remove this team member?')) { await db.from('team').delete().eq('id', id); load() } }
  if (!ready) return <p style={{ padding: 20 }}>Loading…</p>
  if (!me) return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}><h2 style={{ marginTop: 0 }}>Admin login</h2>
      <form className="card" onSubmit={login}><F l="Email" name="email" type="email" required /><br /><F l="Password" name="password" type="password" required /><br />
        <button className="btn">Sign in</button><p className="mu">{msg || 'Sign in with the account your national admin created for you.'}</p></form></div>
  )
  const assemblies = [...new Set([...(prov ? ASSEMBLIES[prov] || [] : Object.values(ASSEMBLIES).flat()), ...members.map(m => m.asm).filter(Boolean)])].sort()
  const list = members.filter(m => !q || `${m.name} ${m.phone} ${m.asm}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="wrap" style={{ paddingTop: 20 }}>
      <datalist id="asms">{assemblies.map(a => <option key={a} value={a} />)}</datalist>
      <p><a href="/">← Home</a> · {prov ? `${prov} admin` : 'National admin'} · <button className="btn g" onClick={async () => { await db.auth.signOut(); setMe(null) }}>Sign out</button> <b>{msg}</b></p>
      <div className="grid">{[['Congregants', members.length], ['Members', members.filter(m => m.status === 'Member').length], ['Visitors', members.filter(m => m.status === 'Visitor').length]].map(([l, n]) => <div className="stat" key={l}><b>{n}</b>{l}</div>)}</div>
      <h2>Add congregant</h2>
      <form className="card" onSubmit={addMember}><div className="form">
        <F l="Full name *" name="name" required /><F l="Phone" name="phone" /><F l="Email" name="email" />
        <div><label>Gender</label><select name="gender"><option></option><option>Male</option><option>Female</option></select></div>
        <F l="Date of birth" name="dob" type="date" /><F l="Address" name="addr" /><F l="Assembly *" name="asm" list="asms" required /><ProvSel />
        <div><label>Status</label><select name="status"><option>Member</option><option>Visitor</option><option>New Convert</option><option>Inactive</option></select></div>
        <F l="Ministry" name="ministry" /><div><label>Baptised?</label><select name="baptised"><option>No</option><option>Yes</option></select></div><F l="Next of kin" name="kin" /><F l="Notes" name="notes" />
      </div><button className="btn">Save congregant</button></form>
      <h2>Congregants</h2>
      <input placeholder="Search name, phone, assembly…" value={q} onChange={e => setQ(e.target.value)} />
      <div style={{ overflowX: 'auto', marginTop: 10 }}><table><thead><tr><th>Name</th><th>Assembly</th><th>Province</th><th>Phone</th><th>Status</th><th></th></tr></thead>
        <tbody>{list.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.asm}</td><td>{m.prov}</td><td>{m.phone}</td><td>{m.status}</td><td><button className="btn g" onClick={() => delMember(m.id)}>Delete</button></td></tr>)}</tbody></table></div>
      <h2>Service / Big Sunday report</h2>
      <form className="card" onSubmit={addReport}><div className="form">
        <ProvSel /><F l="Assembly / venue" name="asm" list="asms" /><F l="Date *" name="date" type="date" required /><F l="Total attendance (min = ticked)" name="count" type="number" min="0" />
        <F l="Preacher" name="preacher" /><F l="Title / scripture" name="title" /></div>
        <label>The word (summary)</label><textarea name="word" rows="3" />
        <details style={{ margin: '10px 0' }}><summary>Mark who attended ({present.size})</summary>
          <div style={{ maxHeight: 280, overflow: 'auto' }}>{list.map(m => <label key={m.id} style={{ display: 'flex', gap: 8, padding: 4, color: 'var(--tx)' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={present.has(m.id)} onChange={e => { const s = new Set(present); e.target.checked ? s.add(m.id) : s.delete(m.id); setPresent(s) }} />{m.name} <span className="mu">{m.asm}</span></label>)}</div></details>
        <button className="btn">Publish report</button></form>
      <h2>Add event</h2>
      <form className="card" onSubmit={addEvent}><div className="form"><F l="Title *" name="title" required /><F l="Date *" name="date" type="date" required /><F l="Time" name="time" type="time" /><F l="Venue" name="venue" /><ProvSel /></div>
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
            <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Name</th><th>Assembly</th><th>Attendance</th></tr></thead>
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
        <form className="card" onSubmit={addTeam}><div className="form">
          <F l="Full name *" name="name" required />
          <F l="Role *" name="role" list="roles" required /><datalist id="roles">{ROLES.map(r => <option key={r} value={r} />)}</datalist>
          <F l="Assembly" name="asm" list="asms" />
          <div><label>Province</label><select name="prov"><option></option>{PROV.map(p => <option key={p}>{p}</option>)}</select></div>
          <F l="Photo" name="photo" type="file" accept="image/*" />
        </div><button className="btn">Add team member</button></form>
        <div style={{ overflowX: 'auto', marginTop: 10 }}><table><thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>Assembly</th><th>Province</th><th></th></tr></thead>
          <tbody>{team.map(x => <tr key={x.id}><td>{x.photo_url && <img src={x.photo_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} />}</td><td>{x.name}</td><td>{x.role}</td><td>{x.asm}</td><td>{x.prov}</td><td><button className="btn g" onClick={() => delTeam(x.id)}>Remove</button></td></tr>)}</tbody></table></div>
      </>}
    </div>
  )
}
