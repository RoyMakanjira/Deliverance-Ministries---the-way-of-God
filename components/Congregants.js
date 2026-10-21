'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { sameAsm } from '@/lib/assemblies'
// Congregant details are private: the database only returns them to a signed-in admin
export default function Congregants({ asm, prov }) {
  const [list, setList] = useState(null)
  useEffect(() => {
    (async () => {
      const { data: { session } } = await db.auth.getSession()
      if (!session) return setList(false)
      const { data } = await db.from('members').select('id,name,phone,gender,status,ministry,asm').eq('prov', prov).order('name')
      setList((data || []).filter(m => sameAsm(m.asm, asm)))
    })()
  }, [asm, prov])
  if (list === null) return <p className="mu">Loading…</p>
  if (list === false) return <div className="card"><p className="mu" style={{ margin: 0 }}>The congregant list is private. <a href="/admin">Sign in as an admin</a> to see it.</p></div>
  if (!list.length) return <p className="mu">No congregants recorded for {asm} yet.</p>
  return (
    <div className="card"><p className="mu" style={{ marginTop: 0 }}>{list.length} {list.length === 1 ? 'congregant' : 'congregants'}</p>
      <div className="scroll"><table><thead><tr><th>Name</th><th>Phone</th><th>Gender</th><th>Status</th><th>Ministry</th></tr></thead>
        <tbody>{list.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.phone ? <a href={`tel:${m.phone}`}>{m.phone}</a> : '—'}</td><td>{m.gender || '—'}</td><td>{m.status || '—'}</td><td>{m.ministry || '—'}</td></tr>)}</tbody></table></div></div>
  )
}
