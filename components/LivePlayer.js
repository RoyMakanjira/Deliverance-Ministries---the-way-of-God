import { embedUrl } from '@/lib/live'
// The live stream, or a button to it when the link is not YouTube or Facebook
export default function LivePlayer({ live }) {
  const src = embedUrl(live.url)
  return (
    <div className="live-box">
      <p className="live-tag"><span className="live-dot" /> LIVE NOW · {live.title}</p>
      {src && <iframe className="live-frame" src={src} title={live.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />}
      <a className={src ? 'btn g' : 'btn'} href={live.url} target="_blank" rel="noopener noreferrer">{src ? 'Not playing? Watch it here' : 'Watch the live service'}</a>
    </div>
  )
}
