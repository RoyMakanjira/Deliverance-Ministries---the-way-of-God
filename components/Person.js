export default function Person({ x }) {
  return (
    <div className="person">{x.photo_url ? <img src={x.photo_url} alt={x.name} /> : <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 56 }}>{x.name[0]}</span>}
      <div><b>{x.name}</b><br />{x.role}<br /><small>{[x.asm, x.prov].filter(Boolean).join(' · ')}</small></div></div>
  )
}
