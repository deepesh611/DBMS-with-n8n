export interface Member {
  id: string
  name: string
  email: string
  phone: string
  dob: string
  address: string
  emergencyContact: string
  joinDate: string
  profilePicUrl?: string
}

export interface MemberStats {
  totalMembers: number
  activeMembers: number
  newThisMonth: number
  departments: number
}