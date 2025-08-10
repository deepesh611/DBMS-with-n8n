// Types aligned with the MySQL schema + n8n payloads

export type Title = 'Mr' | 'Ms' | 'Mrs' | 'Dr'
export type FamilyStatus = 'Here' | 'Origin Country'
export type PhoneType = 'Primary' | 'WhatsApp' | 'Emergency' | 'Origin Country'
export type RelationshipType = 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other'

export interface MemberPhone {
  id?: string
  member_id?: string | number
  phone_type: PhoneType
  phone_number: string
  is_active?: boolean
  created_at?: string
}

export interface MemberEmployment {
  id?: string
  member_id?: string | number
  company_name?: string
  designation?: string
  profession?: string
  is_employed: boolean
  employment_start_date?: string
  is_current?: boolean
  created_at?: string
  updated_at?: string
}

export interface FamilyRelationship {
  id?: string
  member_id?: string | number
  related_member_id?: string | number
  relationship_type: RelationshipType
  created_at?: string
  // For creation convenience (n8n can create related member and return id)
  related_member?: Partial<Member>
}

export interface Member {
  id: string | number
  title: Title
  first_name: string
  middle_name?: string
  last_name: string
  family_name?: string
  dob: string
  email?: string
  baptism_date?: string
  baptism_church?: string
  baptism_country?: string
  family_status: FamilyStatus
  carsel?: string
  local_address?: string
  church_joining_date: string
  profile_pic?: string
  family_photo?: string
  created_at?: string
  updated_at?: string

  // Related collections
  phones: MemberPhone[]
  employment?: MemberEmployment | null
  relationships: FamilyRelationship[]
}

export interface MemberStats {
  totalMembers: number
  activeMembers: number // Treat all as active for now
  newThisMonth: number
  departments: number // Using unique professions count here
}

// Dynamic, multi-step Add/Edit form data
export interface MemberFormData {
  // Step 1: Basic info
  title: Title
  first_name: string
  middle_name?: string
  last_name: string
  family_name?: string
  dob: string
  email?: string
  family_status: FamilyStatus
  carsel?: string
  local_address?: string
  church_joining_date: string

  // Step 2: Baptism
  baptism_date?: string
  baptism_church?: string
  baptism_country?: string

  // Step 3: Phones
  primary_phone?: string
  whatsapp_phone?: string
  emergency_phone?: string
  origin_phone?: string

  // Step 4: Employment
  is_employed: boolean
  company_name?: string
  designation?: string
  profession?: string
  employment_start_date?: string

  // Step 5: Family (conditional)
  is_married?: boolean
  spouse?: {
    title: Title
    first_name: string
    middle_name?: string
    last_name: string
    dob?: string
    email?: string
  }
  children?: Array<{
    title: Title
    first_name: string
    last_name: string
    dob?: string
    email?: string
  }>

  // Images (URLs or base64 for now)
  profile_pic?: string
  family_photo?: string
}
