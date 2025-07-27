export interface Member {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  avatar?: string
}

export interface MemberStats {
  totalMembers: number
  activeMembers: number
  newThisMonth: number
  departments: number
}