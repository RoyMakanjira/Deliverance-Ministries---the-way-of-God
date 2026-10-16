'use client'
const NAT = '263789016651'
export default function Register() {
  function send(e) {
    e.preventDefault()
    const v = Object.fromEntries(new FormData(e.target))
    const t = ['REGISTRATION', `Name: ${v.name}`, `Phone: ${v.phone}`, `Gender: ${v.gender}`, `DOB: ${v.dob}`, `Address: ${v.addr}`, `Assembly: ${v.asm}`, `Province: ${v.prov}`, `Ministry: ${v.min}`].join('\n')
    window.open(`https://wa.me/${NAT}?text=${encodeURIComponent(t)}`, '_blank')
  }
  const P = ['Harare', 'Hwedza', 'Manicaland', 'Mozambique']
  return (
    <form className="card" onSubmit={send}>
      <div className="form">
        <div><label>Full name *</label><input name="name" required /></div>
        <div><label>Phone / WhatsApp</label><input name="phone" /></div>
        <div><label>Gender</label><select name="gender"><option></option><option>Male</option><option>Female</option></select></div>
        <div><label>Date of birth</label><input name="dob" type="date" /></div>
        <div><label>Address</label><input name="addr" /></div>
        <div><label>Assembly *</label><input name="asm" required /></div>
        <div><label>Province</label><select name="prov">{P.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label>Ministry (optional)</label><input name="min" /></div>
      </div>
      <button className="btn">Send registration on WhatsApp</button>
      <p className="mu">Your details go to the church admin on WhatsApp (+263 789 016 651).</p>
    </form>
  )
}
