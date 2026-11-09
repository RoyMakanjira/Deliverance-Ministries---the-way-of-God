'use client'
import { useEffect, useState } from 'react'
import { supabase as db } from '@/lib/supabase'
import { embedUrl } from '@/lib/live'
// National admin: start and end the live stream shown across the site
export default function LiveAdmin() {
  const [live, setLive] = useState(null), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { db.from('content').select('title,body').eq('key', 'live').maybeSingle().then(({ data }) => setLive(data || {})) }, [])
  async function save(title, body) {
    setBusy(true)
    const { error } = await db.from('content').upsert({ key: 'live', title: title || 'Live service', body, updated_at: new Date().toISOString() })
    setBusy(false)
    if (error) return setMsg(error.message)
    setLive({ title, body }); setMsg(body ? 'You are live. The site shows it within a minute.' : 'Live stream ended. It disappears from the site within a minute.')
  }
  function goLive(e) {
    e.preventDefault(); const f = new FormData(e.target), url = f.get('url').trim()
    if (!/^https?:\/\//.test(url)) return setMsg('Paste the full link, starting with https://')
    save(f.get('title').trim(), url)
  }
  if (!live) return <p className="mu">Loading…</p>
  return (
    <div className="card" style={{ borderTop: `5px solid ${live.body ? 'var(--red)' : 'var(--bd)'}` }}>
      {msg && <p><b>{msg}</b></p>}
      {live.body ? <>
        <p className="live-tag"><span className="live-dot" /> LIVE NOW · {live.title}</p>
        <p className="mu" style={{ wordBreak: 'break-all' }}>{live.body}</p>
        <button className="btn del g" disabled={busy} onClick={() => confirm('End the live stream on the site?') && save(live.title, null)}>End live</button>
      </> : <form onSubmit={goLive}>
        <p className="mu" style={{ marginTop: 0 }}>Start the live video on Facebook or YouTube first, then copy its link and paste it here.</p>
        <div className="form">
          <div><label>Live video link *</label><input name="url" type="url" required placeholder="https://www.facebook.com/wogchurchint/videos/…" /></div>
          <div><label>What is on? *</label><input name="title" required placeholder="e.g. Sunday Service, Bonda Youth Revival" /></div></div>
        <button className="btn" disabled={busy}>🔴 Go live</button>
        <p className="mu">Facebook and YouTube links play on the site. Any other link shows a “Watch the live service” button instead.</p>
      </form>}
      {live.body && !embedUrl(live.body) && <p className="mu">This link can't play on the site, so visitors get a button to open it.</p>}
    </div>
  )
}
