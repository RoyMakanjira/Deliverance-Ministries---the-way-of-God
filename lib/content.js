// Shown until an admin writes their own text in the dashboard
export const SECTIONS = [
  { key: 'about', title: 'About Us', body: 'Deliverance Ministries & The Way of God Church International is a family of believers across Harare, Manicaland, Hwedza and Mozambique, gathered to worship God and share the good news of Jesus Christ.' },
  { key: 'women', title: "Women's Ministry", body: 'A place for women of every age to grow in faith, pray together and support one another.' },
  { key: 'youth', title: 'Youth Ministry', body: 'Raising young people who love God, serve the church and lead with integrity.' },
  { key: 'children', title: "Children's Ministry", body: 'Teaching children the Word of God through Sunday School, songs and fellowship.' },
]
export const withDefaults = rows => SECTIONS.map(s => {
  const r = (rows || []).find(x => x.key === s.key) || {}
  return { ...s, ...Object.fromEntries(Object.entries(r).filter(([, v]) => v)) }
})
