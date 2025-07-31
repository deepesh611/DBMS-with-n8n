// New complex member types for the updated database schema

export interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  dob: string
  gender: 'male' | 'female' | 'other'
  marital_status: 'single' | 'married' | 'divorced' | 'widowed'
  profile_pic?: string
  join_date: string
  status: 'active' | 'inactive' | 'suspended'
  created_at?: string
  updated_at?: string
  
  // Related data
  addresses: MemberAddress[]
  emergency_contacts: EmergencyContact[]
  family_members: FamilyMember[]
  employment?: MemberEmployment
  skills: MemberSkill[]
}

export interface MemberAddress {
  id?: string
  member_id?: string
  address_type: 'home' | 'work' | 'mailing'
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  is_primary: boolean
  created_at?: string
}

export interface EmergencyContact {
  id?: string
  member_id?: string
  contact_name: string
  relationship: string
  phone: string
  email?: string
  is_primary: boolean
  created_at?: string
}

export interface FamilyMember {
  id?: string
  member_id?: string
  family_member_name: string
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
  dob?: string
  phone?: string
  email?: string
  created_at?: string
}

export interface MemberEmployment {
  id?: string
  member_id?: string
  company_name: string
  job_title: string
  department?: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'retired' | 'unemployed'
  start_date?: string
  end_date?: string
  salary_range?: 'below_30k' | '30k_50k' | '50k_75k' | '75k_100k' | 'above_100k'
  is_current: boolean
  created_at?: string
}

export interface MemberSkill {
  id?: string
  member_id?: string
  skill_name: string
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: 'technical' | 'professional' | 'hobby' | 'language' | 'other'
  created_at?: string
}

export interface MemberStats {
  totalMembers: number
  activeMembers: number
  newThisMonth: number
  departments: number
}

// Form data interface for creating/updating members
export interface MemberFormData {
  // Basic info
  first_name: string
  last_name: string
  email: string
  phone: string
  dob: string
  gender: 'male' | 'female' | 'other'
  marital_status: 'single' | 'married' | 'divorced' | 'widowed'
  
  // Single primary address
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  
  // Single primary emergency contact
  emergency_contact_name: string
  emergency_relationship: string
  emergency_phone: string
  emergency_email?: string
  
  // Employment (optional)
  company_name?: string
  job_title?: string
  department?: string
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'retired' | 'unemployed'
  start_date?: string
  salary_range?: 'below_30k' | '30k_50k' | '50k_75k' | '75k_100k' | 'above_100k'
  
  // Additional arrays for multiple entries (handled separately)
  additional_addresses?: MemberAddress[]
  additional_contacts?: EmergencyContact[]
  family_members?: FamilyMember[]
  skills?: MemberSkill[]
}