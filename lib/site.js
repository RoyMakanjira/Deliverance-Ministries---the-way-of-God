import { supabase as db } from '@/lib/supabase'
import { ASSEMBLIES, sameAsm } from '@/lib/assemblies'
import { withDefaults } from '@/lib/content'
import { since, upcoming, today } from '@/lib/dates'
// Data the public pages share, so the homepage and the menu pages always show the same thing.

// all content rows, merged with the built-in defaults; raw = the rows as stored (for 'live' and 'hero')
export const getContent = async () => {
  const { data } = await db.from('content').select('*')
  const sections = withDefaults(data), get = k => sections.find(s => s.key === k)
  return { raw: data || [], sections, get }
}

const ORD = ['Bishop', 'Overseer', 'Secretary', 'Treasurer', 'Administrator']
const oi = r => (ORD.indexOf(r) < 0 ? 9 : ORD.indexOf(r))
// titles shown under National Executive Board, in this order; anyone else goes under Meet the Leaders
const TOP = ['bishop', 'overseer', 'secretary', 'administrator', 'admin', 'advisor', 'adviser']
const ti = x => TOP.indexOf(x.role.trim().toLowerCase().replace(/s$/, ''))
export const getTeam = async () => {
  const team = (await db.from('team').select('*').order('name')).data || []
  return {
    heads: team.filter(x => ti(x) >= 0).sort((a, c) => ti(a) - ti(c)),
    top: team.filter(x => ti(x) < 0 && x.role !== 'Assembly Pastor').sort((a, c) => oi(a.role) - oi(c.role)),
    pastors: team.filter(x => x.role === 'Assembly Pastor'),
  }
}

// one card per assembly: card picture (or first church photo) and pastor
export const getAsmCards = async pastors => {
  const [ph, ai] = await Promise.all([
    db.from('assembly_photos').select('asm,image_url').eq('kind', 'church').order('created_at'),
    db.from('assembly_info').select('asm,cover_url').not('cover_url', 'is', null),
  ])
  return Object.entries(ASSEMBLIES).flatMap(([p, a]) => a.map(asm => ({ asm, prov: p,
    cover: (ai.data || []).find(x => x.asm === asm)?.cover_url || (ph.data || []).find(x => x.asm === asm)?.image_url,
    pastor: pastors.find(x => sameAsm(x.asm, asm))?.name })))
}

export const getEvents = async () => {
  const t = today(), { data } = await db.from('events').select('*').gte('date', since(t)).order('date')
  return upcoming(data, t)
}

export const getReports = async (limit = 12) => (await db.from('reports').select('*').order('date', { ascending: false }).limit(limit)).data || []

export const getGalleryPics = async (limit = 6) =>
  (await db.from('gallery').select('id,title,image_url').eq('kind', 'photo').order('created_at', { ascending: false }).limit(limit)).data || []
