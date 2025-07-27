import { useState, useEffect } from "react"
import { useMembers } from "@/hooks/use-members"
import { Member } from "@/types/member"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface MemberFormProps {
  member?: Member | null
  onSave: () => void
  onCancel: () => void
}

export function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const { addMember, updateMember, loading } = useMembers()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    status: "active" as Member['status']
  })

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        position: member.position,
        department: member.department,
        status: member.status
      })
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (member) {
        await updateMember(member.id, formData)
        toast({
          title: "Member updated",
          description: "Member information has been successfully updated.",
        })
      } else {
        await addMember({
          ...formData,
          joinDate: new Date().toISOString().split('T')[0]
        })
        toast({
          title: "Member added",
          description: "New member has been successfully added.",
        })
      }
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${member ? 'update' : 'add'} member. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {member ? 'Edit Member' : 'Add New Member'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {member ? 'Update member information' : 'Add a new member to your organization'}
        </p>
      </div>

      <Card className="bg-gradient-card border-0 shadow-elegant max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Enter position/role"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Executive">Executive</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="HR">Human Resources</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as Member['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              {loading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}