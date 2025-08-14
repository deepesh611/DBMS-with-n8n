import { useState, useCallback } from 'react'
import type { Member, MemberStats, MemberFormData, MemberPhone, MemberEmployment, FamilyRelationship } from '@/types/member-new'
import { toast } from 'sonner'

// Mock data for development (new schema)
const mockMembers: Member[] = [
  {
    id: 1,
    title: 'Mr',
    first_name: 'John',
    last_name: 'Doe',
    dob: '1990-05-15',
    email: 'john.doe@example.com',
    family_status: 'Here',
    church_joining_date: '2024-01-15',
    phones: [
      { phone_type: 'Primary', phone_number: '+1234567890', is_active: true },
      { phone_type: 'WhatsApp', phone_number: '+1234567890', is_active: true }
    ],
    employment: {
      is_employed: true,
      company_name: 'Tech Corp',
      designation: 'Engineer',
      profession: 'Software',
      employment_start_date: '2020-01-01',
      is_current: true
    },
    relationships: []
  },
  {
    id: 2,
    title: 'Ms',
    first_name: 'Sarah',
    last_name: 'Johnson',
    dob: '1988-12-03',
    email: 'sarah.johnson@example.com',
    family_status: 'Origin Country',
    church_joining_date: '2024-02-01',
    phones: [
      { phone_type: 'Primary', phone_number: '+1987654321', is_active: true }
    ],
    employment: {
      is_employed: true,
      company_name: 'Design Studio',
      designation: 'Designer',
      profession: 'UI/UX',
      employment_start_date: '2021-03-10',
      is_current: true
    },
    relationships: []
  }
]

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const stats: MemberStats = {
    totalMembers: members.length,
    activeMembers: members.length,
    newThisMonth: members.filter(m => {
      const joinDate = new Date(m.church_joining_date)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length,
    // Unique professions count from employment
    departments: new Set(
      members
        .map(m => m.employment?.profession)
        .filter(Boolean) as string[]
    ).size
  }

  // Send data to n8n webhook
  const sendToN8N = async (action: string, data: any) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    console.log('Webhook URL:', webhookUrl)
    console.log('Sending action:', action, 'with data:', data)
    
    if (!webhookUrl) {
      console.warn('N8N webhook URL not configured')
      return null
    }

    try {
      const payload = { action, data, timestamp: new Date().toISOString() }
      console.log('Full payload:', payload)
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const result = await response.json()
      console.log('Response data:', result)
      return result
    } catch (error) {
      console.error('Error sending to n8n:', error)
      throw error
    }
  }

  // Convert form data to backend payload (matches DATABASE_SCHEMA_NEW.md guidance)
  const convertFormDataToPayload = (form: MemberFormData) => {
    const member = {
      title: form.title,
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      family_name: form.family_name,
      dob: form.dob,
      email: form.email,
      baptism_date: form.baptism_date,
      baptism_church: form.baptism_church,
      baptism_country: form.baptism_country,
      family_status: form.family_status,
      carsel: form.carsel,
      local_address: form.local_address,
      church_joining_date: form.church_joining_date,
      profile_pic: form.profile_pic,
      family_photo: form.family_photo
    }

    const phones: MemberPhone[] = []
    if (form.primary_phone) phones.push({ phone_type: 'Primary', phone_number: form.primary_phone, is_active: true })
    if (form.whatsapp_phone) phones.push({ phone_type: 'WhatsApp', phone_number: form.whatsapp_phone, is_active: true })
    if (form.emergency_phone) phones.push({ phone_type: 'Emergency', phone_number: form.emergency_phone, is_active: true })
    if (form.origin_phone) phones.push({ phone_type: 'Origin Country', phone_number: form.origin_phone, is_active: true })

    let employment: MemberEmployment | undefined
    if (form.is_employed) {
      employment = {
        is_employed: true,
        company_name: form.company_name,
        designation: form.designation,
        profession: form.profession,
        employment_start_date: form.employment_start_date,
        is_current: true
      }
    }

    const relationships: FamilyRelationship[] = []
    if (form.is_married && form.spouse) {
      relationships.push({
        relationship_type: 'Spouse',
        related_member: {
          title: form.spouse.title,
          first_name: form.spouse.first_name,
          middle_name: form.spouse.middle_name,
          last_name: form.spouse.last_name,
          dob: form.spouse.dob,
          email: form.spouse.email,
          family_status: form.family_status,
          church_joining_date: form.church_joining_date,
          phones: [],
          relationships: []
        } as Partial<Member>
      })
    }
    if (form.children?.length) {
      form.children.forEach((c) => {
        relationships.push({
          relationship_type: 'Child',
          related_member: {
            title: c.title,
            first_name: c.first_name,
            last_name: c.last_name,
            dob: c.dob,
            email: c.email,
            family_status: form.family_status,
            church_joining_date: form.church_joining_date,
            phones: [],
            relationships: []
          } as Partial<Member>
        })
      })
    }

    return { member, phones, employment, relationships }
  }

  // Add new member
  const addMember = useCallback(async (formData: MemberFormData) => {
    setLoading(true)
    try {
      const payload = convertFormDataToPayload(formData)
      const result = await sendToN8N('CREATE_MEMBER', payload)

      // Construct local Member object
      const localMember: Member = {
        id: result?.member_id || Date.now(),
        title: formData.title,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        family_name: formData.family_name,
        dob: formData.dob,
        email: formData.email,
        baptism_date: formData.baptism_date,
        baptism_church: formData.baptism_church,
        baptism_country: formData.baptism_country,
        family_status: formData.family_status,
        carsel: formData.carsel,
        local_address: formData.local_address,
        church_joining_date: formData.church_joining_date,
        profile_pic: formData.profile_pic,
        family_photo: formData.family_photo,
        phones: [
          ...(formData.primary_phone ? [{ phone_type: 'Primary', phone_number: formData.primary_phone } as MemberPhone] : []),
          ...(formData.whatsapp_phone ? [{ phone_type: 'WhatsApp', phone_number: formData.whatsapp_phone } as MemberPhone] : []),
          ...(formData.emergency_phone ? [{ phone_type: 'Emergency', phone_number: formData.emergency_phone } as MemberPhone] : []),
          ...(formData.origin_phone ? [{ phone_type: 'Origin Country', phone_number: formData.origin_phone } as MemberPhone] : []),
        ],
        employment: formData.is_employed
          ? {
              is_employed: true,
              company_name: formData.company_name,
              designation: formData.designation,
              profession: formData.profession,
              employment_start_date: formData.employment_start_date,
              is_current: true
            }
          : null,
        relationships: []
      }

      setMembers(prev => [...prev, localMember])
      toast.success('Member added successfully')
      return localMember
    } catch (error) {
      console.error('Error adding member:', error)
      // Fallback to local state in case n8n is unavailable
      const fallbackMember: Member = {
        id: Date.now(),
        title: formData.title,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        family_name: formData.family_name,
        dob: formData.dob,
        email: formData.email,
        baptism_date: formData.baptism_date,
        baptism_church: formData.baptism_church,
        baptism_country: formData.baptism_country,
        family_status: formData.family_status,
        carsel: formData.carsel,
        local_address: formData.local_address,
        church_joining_date: formData.church_joining_date,
        profile_pic: formData.profile_pic,
        family_photo: formData.family_photo,
        phones: [
          ...(formData.primary_phone ? [{ phone_type: 'Primary', phone_number: formData.primary_phone } as MemberPhone] : []),
          ...(formData.whatsapp_phone ? [{ phone_type: 'WhatsApp', phone_number: formData.whatsapp_phone } as MemberPhone] : []),
          ...(formData.emergency_phone ? [{ phone_type: 'Emergency', phone_number: formData.emergency_phone } as MemberPhone] : []),
          ...(formData.origin_phone ? [{ phone_type: 'Origin Country', phone_number: formData.origin_phone } as MemberPhone] : []),
        ],
        employment: formData.is_employed
          ? {
              is_employed: true,
              company_name: formData.company_name,
              designation: formData.designation,
              profession: formData.profession,
              employment_start_date: formData.employment_start_date,
              is_current: true
            }
          : null,
        relationships: []
      }
      setMembers(prev => [...prev, fallbackMember])
      toast.success('Member added locally (fallback)')
      return fallbackMember
    } finally {
      setLoading(false)
    }
  }, [])

  // Update member
  const updateMember = useCallback(async (id: string | number, formData: MemberFormData) => {
    setLoading(true)
    try {
      const payload = convertFormDataToPayload(formData)
      await sendToN8N('UPDATE_MEMBER', { id, ...payload })
      
      // Update local state with the same structure as addMember
      const updatedMember: Member = {
        id: typeof id === 'string' ? parseInt(id) : id,
        title: formData.title,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        family_name: formData.family_name,
        dob: formData.dob,
        email: formData.email,
        baptism_date: formData.baptism_date,
        baptism_church: formData.baptism_church,
        baptism_country: formData.baptism_country,
        family_status: formData.family_status,
        carsel: formData.carsel,
        local_address: formData.local_address,
        church_joining_date: formData.church_joining_date,
        profile_pic: formData.profile_pic,
        family_photo: formData.family_photo,
        phones: [
          ...(formData.primary_phone ? [{ phone_type: 'Primary', phone_number: formData.primary_phone } as MemberPhone] : []),
          ...(formData.whatsapp_phone ? [{ phone_type: 'WhatsApp', phone_number: formData.whatsapp_phone } as MemberPhone] : []),
          ...(formData.emergency_phone ? [{ phone_type: 'Emergency', phone_number: formData.emergency_phone } as MemberPhone] : []),
          ...(formData.origin_phone ? [{ phone_type: 'Origin Country', phone_number: formData.origin_phone } as MemberPhone] : []),
        ],
        employment: formData.is_employed
          ? {
              is_employed: true,
              company_name: formData.company_name,
              designation: formData.designation,
              profession: formData.profession,
              employment_start_date: formData.employment_start_date,
              is_current: true
            }
          : null,
        relationships: []
      }
      
      setMembers(prev => prev.map(m => m.id === id ? updatedMember : m))
      toast.success('Member updated successfully')
    } catch (error) {
      console.error('Error updating member:', error)
      // Fallback to local state update
      const fallbackMember: Member = {
        id: typeof id === 'string' ? parseInt(id) : id,
        title: formData.title,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        family_name: formData.family_name,
        dob: formData.dob,
        email: formData.email,
        baptism_date: formData.baptism_date,
        baptism_church: formData.baptism_church,
        baptism_country: formData.baptism_country,
        family_status: formData.family_status,
        carsel: formData.carsel,
        local_address: formData.local_address,
        church_joining_date: formData.church_joining_date,
        profile_pic: formData.profile_pic,
        family_photo: formData.family_photo,
        phones: [
          ...(formData.primary_phone ? [{ phone_type: 'Primary', phone_number: formData.primary_phone } as MemberPhone] : []),
          ...(formData.whatsapp_phone ? [{ phone_type: 'WhatsApp', phone_number: formData.whatsapp_phone } as MemberPhone] : []),
          ...(formData.emergency_phone ? [{ phone_type: 'Emergency', phone_number: formData.emergency_phone } as MemberPhone] : []),
          ...(formData.origin_phone ? [{ phone_type: 'Origin Country', phone_number: formData.origin_phone } as MemberPhone] : []),
        ],
        employment: formData.is_employed
          ? {
              is_employed: true,
              company_name: formData.company_name,
              designation: formData.designation,
              profession: formData.profession,
              employment_start_date: formData.employment_start_date,
              is_current: true
            }
          : null,
        relationships: []
      }
      setMembers(prev => prev.map(m => m.id === id ? fallbackMember : m))
      toast.success('Member updated locally (fallback)')
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete member
  const deleteMember = useCallback(async (id: string | number) => {
    setLoading(true)
    try {
      await sendToN8N('DELETE_MEMBER', { id })
      setMembers(prev => prev.filter(m => m.id !== id))
      toast.success('Member deleted successfully')
    } catch (error) {
      console.error('Error deleting member:', error)
      setMembers(prev => prev.filter(m => m.id !== id))
      toast.success('Member deleted locally (fallback)')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch all members from n8n
  const fetchAllMembers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await sendToN8N('FETCH_ALL_MEMBERS', {})
      if (result?.success && Array.isArray(result.members)) {
        setMembers(result.members as Member[])
        toast.success('Members loaded from database')
      } else {
        console.warn('No members returned from webhook, keeping existing data')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      console.warn('N8N webhook URL not configured, using mock data')
      // Keep mock data if webhook fails
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch detailed member data
  const fetchMemberDetails = useCallback(async (memberId: string | number) => {
    try {
      console.log('Sending FETCH_MEMBER_DETAILS request for member ID:', memberId)
      const result = await sendToN8N('FETCH_MEMBER_DETAILS', { data: { member_id: memberId } })
      console.log('FETCH_MEMBER_DETAILS response:', result)
      
      if (result?.success && result.member) {
        return result.member
      }
      throw new Error('Failed to fetch member details - no member in response')
    } catch (error) {
      console.error('Error fetching member details:', error)
      throw error
    }
  }, [])

  // Transform detailed member data to standard Member format
  const transformDetailedMember = (detailedMember: any): Member => {
    const phones: MemberPhone[] = []
    if (detailedMember.phone_numbers) {
      Object.entries(detailedMember.phone_numbers).forEach(([type, number]) => {
        phones.push({ phone_type: type as any, phone_number: number as string, is_active: true })
      })
    }

    return {
      ...detailedMember,
      phones,
      employment: detailedMember.employment || null,
      relationships: detailedMember.family || []
    }
  }

  // Fetch all members with detailed information for reports
  const fetchAllMembersDetailed = useCallback(async () => {
    setLoading(true)
    try {
      const basicMembers = await sendToN8N('FETCH_ALL_MEMBERS', {})
      if (!basicMembers?.success || !Array.isArray(basicMembers.members)) {
        return members // Fallback to current state
      }

      const detailedMembers = await Promise.all(
        basicMembers.members.map(async (member: Member) => {
          try {
            const detailed = await fetchMemberDetails(member.id)
            return transformDetailedMember(detailed)
          } catch {
            return member // Fallback to basic data if details fail
          }
        })
      )

      return detailedMembers
    } catch (error) {
      console.error('Error fetching detailed members:', error)
      return members // Fallback to current state
    } finally {
      setLoading(false)
    }
  }, [members, fetchMemberDetails])

  return {
    members,
    stats,
    loading,
    addMember,
    updateMember,
    deleteMember,
    fetchAllMembers,
    fetchMemberDetails,
    fetchAllMembersDetailed
  }
}
