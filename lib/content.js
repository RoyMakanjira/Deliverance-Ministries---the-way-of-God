// Shown until an admin writes their own text in the dashboard
export const SECTIONS = [
  { key: 'about', title: 'About Us', body: 'Deliverance Ministries & The Way of God Church International is a family of believers across Harare, Manicaland, Hwedza and Mozambique, gathered to worship God and share the good news of Jesus Christ.' },
  { key: 'men', title: "Men's Ministry", image_url: '/ministries/men.svg', body: 'Building men of faith who lead their homes, serve the church and stand together in prayer.' },
  { key: 'women', title: "Women's Ministry", image_url: '/ministries/women.svg', body: 'A place for women of every age to grow in faith, pray together and support one another.' },
  { key: 'youth', title: 'Youth Ministry', image_url: '/ministries/youth.svg', body: 'Raising young people who love God, serve the church and lead with integrity.' },
  { key: 'children', title: "Children's Ministry", image_url: '/ministries/children.svg', body: 'Teaching children the Word of God through Sunday School, songs and fellowship.' },
  { key: 'giving', title: 'How to pay', body: 'Payment details will be added here soon. In the meantime, contact the church admin on WhatsApp (+263 789 016 651) to arrange your giving.' },
]
export const MINISTRIES = ['men', 'women', 'youth', 'children']
export const NO_PIC = 'none' // stored as image_url when an admin chooses "no picture"
export const defaultPic = key => SECTIONS.find(s => s.key === key)?.image_url
export const withDefaults = rows => SECTIONS.map(s => {
  const r = (rows || []).find(x => x.key === s.key) || {}
  const m = { ...s, ...Object.fromEntries(Object.entries(r).filter(([, v]) => v)) }
  return m.image_url === NO_PIC ? { ...m, image_url: null, noPic: true } : m
})
