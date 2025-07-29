import { useState, useEffect } from 'react'
import { Member, MemberStats } from '@/types/member'

// Mock data for development
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dob: '1990-05-15',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: '+1234567899',
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    dob: '1988-08-22',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    emergencyContact: '+1234567898',
    joinDate: '2024-01-20'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1234567892',
    dob: '1992-12-03',
    address: '789 Pine St, Chicago, IL 60601',
    emergencyContact: '+1234567897',
    joinDate: '2024-02-01'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1234567893',
    dob: '1985-03-10',
    address: '321 Elm St, Houston, TX 77001',
    emergencyContact: '+1234567896',
    joinDate: '2024-02-15'
  }
]

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [loading, setLoading] = useState(false)

  // Calculate stats
  const stats: MemberStats = {
    totalMembers: members.length,
    activeMembers: members.length, // All members are considered active now
    newThisMonth: members.filter(m => {
      const joinDate = new Date(m.joinDate)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length,
    departments: 1 // Since we removed departments, set to 1 as default
  }

  // n8n webhook functions
  const sendToN8N = async (action: string, data: any) => {
    try {
      setLoading(true)
      // Replace with your n8n webhook URL
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

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
        throw new Error('Failed to send data to n8n')
      }

      return await response.json()
    } catch (error) {
      console.error('n8n webhook error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: Date.now().toString()
    }
    
    try {
      await sendToN8N('create', newMember)
      setMembers(prev => [...prev, newMember])
      return newMember
    } catch (error) {
      // For demo purposes, still add locally if webhook fails
      setMembers(prev => [...prev, newMember])
      throw error
    }
  }

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    try {
      await sendToN8N('update', { id, ...memberData })
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...memberData } : m))
    } catch (error) {
      // For demo purposes, still update locally if webhook fails
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...memberData } : m))
      throw error
    }
  }

  const deleteMember = async (id: string) => {
    try {
      await sendToN8N('delete', { id })
      setMembers(prev => prev.filter(m => m.id !== id))
    } catch (error) {
      // For demo purposes, still delete locally if webhook fails
      setMembers(prev => prev.filter(m => m.id !== id))
      throw error
    }
  }

  const fetchAllMembers = async () => {
    try {
      setLoading(true)
      const response = await sendToN8N('fetch_all', {})
      if (response && response.members) {
        setMembers(response.members)
      }
      return response
    } catch (error) {
      console.error('Failed to fetch members from n8n:', error)
      // Keep using local data if webhook fails
      throw error
    } finally {
      setLoading(false)
    }
  }

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