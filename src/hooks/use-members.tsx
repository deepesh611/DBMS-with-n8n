import { useState, useEffect } from 'react'
import { Member, MemberStats } from '@/types/member'

// Mock data for development
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    position: 'President',
    department: 'Executive',
    joinDate: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    position: 'Vice President',
    department: 'Executive',
    joinDate: '2024-01-20',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1234567892',
    position: 'Treasurer',
    department: 'Finance',
    joinDate: '2024-02-01',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1234567893',
    position: 'Secretary',
    department: 'Admin',
    joinDate: '2024-02-15',
    status: 'pending'
  }
]

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [loading, setLoading] = useState(false)

  // Calculate stats
  const stats: MemberStats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    newThisMonth: members.filter(m => {
      const joinDate = new Date(m.joinDate)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length,
    departments: new Set(members.map(m => m.department)).size
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

  return {
    members,
    stats,
    loading,
    addMember,
    updateMember,
    deleteMember
  }
}