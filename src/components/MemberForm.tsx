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
    dob: "",
    address: "",
    emergencyContact: "",
    profilePicUrl: ""
  })
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string>("")

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        dob: member.dob,
        address: member.address,
        emergencyContact: member.emergencyContact,
        profilePicUrl: member.profilePicUrl || ""
      })
      setProfilePicPreview(member.profilePicUrl || "")
    }
  }, [member])

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePicPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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
        <h1 className="text-2xl md:text-3xl font-bold">
          {member ? 'Edit Member' : 'Add New Member'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {member ? 'Update member information' : 'Add a new member to your organization'}
        </p>
      </div>

      <Card className="bg-gradient-card border-0 shadow-elegant max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <Label htmlFor="profilePic">Profile Picture</Label>
            <div className="flex items-center space-x-4">
              {profilePicPreview && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                  <img 
                    src={profilePicPreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a profile picture (JPG, PNG, or GIF)
                </p>
              </div>
            </div>
          </div>

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
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Enter emergency contact number"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90 transition-smooth w-full md:w-auto"
            >
              {loading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}