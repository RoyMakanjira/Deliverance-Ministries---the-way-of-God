export const ASSEMBLIES = {
  Harare: ['Budiriro', 'Highfield', 'Kuwadzana', 'Eastview', 'Bethel', 'Zengeza', 'Epworth'],
  Manicaland: ['Fairbridge Park', 'Dangamvura', 'Bonda', 'Magetsi', 'Eastern Highlands'],
  Hwedza: ['Masvosva', 'Hwedza Centre'],
  Mozambique: ['Beira'],
}
export const PROV = Object.keys(ASSEMBLIES)
export const provOf = a => PROV.find(p => ASSEMBLIES[p].includes(a)) || ''
