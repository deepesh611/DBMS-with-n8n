import { useState, useCallback } from 'react'
import { Member, MemberStats, MemberFormData } from '@/types/member-new'
import { toast } from 'sonner'

// Mock data for development
const mockMembers: Member[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dob: '1990-05-15',
    gender: 'male',
    marital_status: 'married',
    join_date: '2024-01-15',
    status: 'active',
    addresses: [
      {
        id: '1',
        address_type: 'home',
        street_address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        is_primary: true
      }
    ],
    emergency_contacts: [
      {
        id: '1',
        contact_name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1234567891',
        email: 'jane.doe@example.com',
        is_primary: true
      }
    ],
    family_members: [
      {
        id: '1',
        family_member_name: 'Jane Doe',
        relationship: 'spouse',
        dob: '1992-08-22',
        phone: '+1234567891',
        email: 'jane.doe@example.com'
      }
    ],
    employment: {
      id: '1',
      company_name: 'Tech Corp',
      job_title: 'Software Engineer',
      department: 'Engineering',
      employment_type: 'full_time',
      start_date: '2020-01-15',
      salary_range: '75k_100k',
      is_current: true
    },
    skills: [
      {
        id: '1',
        skill_name: 'JavaScript',
        skill_level: 'advanced',
        category: 'technical'
      },
      {
        id: '2',
        skill_name: 'Project Management',
        skill_level: 'intermediate',
        category: 'professional'
      }
    ]
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1234567892',
    dob: '1988-12-03',
    gender: 'female',
    marital_status: 'single',
    join_date: '2024-02-01',
    status: 'active',
    addresses: [
      {
        id: '2',
        address_type: 'home',
        street_address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90210',
        country: 'USA',
        is_primary: true
      }
    ],
    emergency_contacts: [
      {
        id: '2',
        contact_name: 'Mike Johnson',
        relationship: 'father',
        phone: '+1234567893',
        email: 'mike.johnson@example.com',
        is_primary: true
      }
    ],
    family_members: [],
    employment: {
      id: '2',
      company_name: 'Design Studio',
      job_title: 'UX Designer',
      department: 'Design',
      employment_type: 'full_time',
      start_date: '2021-03-10',
      salary_range: '50k_75k',
      is_current: true
    },
    skills: [
      {
        id: '3',
        skill_name: 'UI/UX Design',
        skill_level: 'expert',
        category: 'professional'
      },
      {
        id: '4',
        skill_name: 'Figma',
        skill_level: 'advanced',
        category: 'technical'
      }
    ]
  }
]

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const stats: MemberStats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    newThisMonth: members.filter(m => {
      const joinDate = new Date(m.join_date)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length,
    departments: [...new Set(members.map(m => m.employment?.department).filter(Boolean))].length
  }

  // Send data to n8n webhook
  const sendToN8N = async (action: string, data: any) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn('N8N webhook URL not configured')
      return null
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending to n8n:', error)
      throw error
    }
  }

  // Convert form data to full member object
  const convertFormDataToMember = (formData: MemberFormData): Omit<Member, 'id'> => {
    return {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender,
      marital_status: formData.marital_status,
      join_date: new Date().toISOString().split('T')[0],
      status: 'active',
      addresses: [
        {
          address_type: 'home',
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          is_primary: true
        },
        ...(formData.additional_addresses || [])
      ],
      emergency_contacts: [
        {
          contact_name: formData.emergency_contact_name,
          relationship: formData.emergency_relationship,
          phone: formData.emergency_phone,
          email: formData.emergency_email,
          is_primary: true
        },
        ...(formData.additional_contacts || [])
      ],
      family_members: formData.family_members || [],
      employment: formData.company_name ? {
        company_name: formData.company_name,
        job_title: formData.job_title!,
        department: formData.department,
        employment_type: formData.employment_type!,
        start_date: formData.start_date,
        salary_range: formData.salary_range,
        is_current: true
      } : undefined,
      skills: formData.skills || []
    }
  }

  // Add new member
  const addMember = useCallback(async (memberData: MemberFormData) => {
    setLoading(true)
    try {
      const newMember = convertFormDataToMember(memberData)
      const result = await sendToN8N('CREATE_MEMBER', newMember)
      
      if (result?.success) {
        const memberWithId = { ...newMember, id: result.member_id || Date.now().toString() }
        setMembers(prev => [...prev, memberWithId])
        toast.success('Member added successfully')
      } else {
        // Fallback to local state if n8n fails
        const memberWithId = { ...newMember, id: Date.now().toString() }
        setMembers(prev => [...prev, memberWithId])
        toast.success('Member added locally (n8n unavailable)')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      // Fallback to local state
      const newMember = convertFormDataToMember(memberData)
      const memberWithId = { ...newMember, id: Date.now().toString() }
      setMembers(prev => [...prev, memberWithId])
      toast.success('Member added locally (fallback)')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update member
  const updateMember = useCallback(async (id: string, memberData: Partial<MemberFormData>) => {
    setLoading(true)
    try {
      await sendToN8N('UPDATE_MEMBER', { id, ...memberData })
      
      setMembers(prev => prev.map(member => 
        member.id === id 
          ? { ...member, ...memberData, updated_at: new Date().toISOString() }
          : member
      ))
      toast.success('Member updated successfully')
    } catch (error) {
      console.error('Error updating member:', error)
      // Fallback to local state
      setMembers(prev => prev.map(member => 
        member.id === id 
          ? { ...member, ...memberData, updated_at: new Date().toISOString() }
          : member
      ))
      toast.success('Member updated locally (fallback)')
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete member
  const deleteMember = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await sendToN8N('DELETE_MEMBER', { id })
      setMembers(prev => prev.filter(member => member.id !== id))
      toast.success('Member deleted successfully')
    } catch (error) {
      console.error('Error deleting member:', error)
      // Fallback to local state
      setMembers(prev => prev.filter(member => member.id !== id))
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
      if (result?.success && result.members) {
        setMembers(result.members)
        toast.success('Members loaded from database')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members from database, using local data')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    members,
    stats,
    loading,
    addMember,
    updateMember,
    deleteMember,
    fetchAllMembers
  }
}