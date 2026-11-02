import Person from '@/components/Person'
// Slowly scrolling strip of team photos (moves right, loops seamlessly, pauses on hover).
// The set is repeated until it is wide enough, then doubled so the loop has no gap.
export default function TeamMarquee({ people }) {
  let set = people
  while (set.length < 6) set = [...set, ...people]
  return (
    <div className="marquee">
      <div className="marquee-track" style={{ animationDuration: `${set.length * 6}s` }}>
        {[...set, ...set].map((x, i) => <div key={i} aria-hidden={i >= people.length || undefined}><Person x={x} /></div>)}
      </div>
    </div>
  )
}
