export const ASSEMBLIES = {
  Harare: ['Budiriro', 'Highfield', 'Kuwadzana', 'Eastview', 'Bethel', 'Zengeza', 'Epworth'],
  Manicaland: ['Fairbridge Park', 'Dangamvura', 'Bonda', 'Magetsi', 'Eastern Highlands'],
  Hwedza: ['Masvosva', 'Hwedza Centre'],
  Mozambique: ['Beira'],
}
export const PROV = Object.keys(ASSEMBLIES)
export const provOf = a => PROV.find(p => ASSEMBLIES[p].includes(a)) || ''
export const slug = a => a.toLowerCase().replace(/[^a-z0-9]+/g, '-')
export const fromSlug = s => Object.values(ASSEMBLIES).flat().find(a => slug(a) === s)
// "Budiriro Assembly", "budiriro" and "Budiriro" all count as the same assembly
export const sameAsm = (x, a) => !!x && x.toLowerCase().replace(/\bassembly\b/g, '').trim() === a.toLowerCase()
