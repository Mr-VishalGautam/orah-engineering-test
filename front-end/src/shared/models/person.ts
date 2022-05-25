export interface Person {
  id: number
  first_name: string
  last_name: string
  photo_url?: string
}

export const PersonHelper = {
  getId:(p:Person)=>p.id,
  getFullName: (p: Person) => `${p.first_name} ${p.last_name}`,
}
