import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMembers } from '@/hooks/use-members-new'
import { Member, MemberFormData, FamilyMember, MemberSkill } from '@/types/member-new'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface MemberFormNewProps {
  member?: Member | null
  onSave: () => void
  onCancel: () => void
}

export function MemberFormNew({ member, onSave, onCancel }: MemberFormNewProps) {
  const { addMember, updateMember, loading } = useMembers()
  
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    marital_status: 'single',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    emergency_contact_name: '',
    emergency_relationship: '',
    emergency_phone: '',
    emergency_email: '',
    company_name: '',
    job_title: '',
    department: '',
    employment_type: 'full_time',
    start_date: '',
    salary_range: 'below_30k',
    family_members: [],
    skills: []
  })

  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)

  // Populate form if editing existing member
  useEffect(() => {
    if (member) {
      const primaryAddress = member.addresses.find(addr => addr.is_primary) || member.addresses[0]
      const primaryContact = member.emergency_contacts.find(contact => contact.is_primary) || member.emergency_contacts[0]
      
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        dob: member.dob,
        gender: member.gender,
        marital_status: member.marital_status,
        street_address: primaryAddress?.street_address || '',
        city: primaryAddress?.city || '',
        state: primaryAddress?.state || '',
        postal_code: primaryAddress?.postal_code || '',
        country: primaryAddress?.country || 'USA',
        emergency_contact_name: primaryContact?.contact_name || '',
        emergency_relationship: primaryContact?.relationship || '',
        emergency_phone: primaryContact?.phone || '',
        emergency_email: primaryContact?.email || '',
        company_name: member.employment?.company_name || '',
        job_title: member.employment?.job_title || '',
        department: member.employment?.department || '',
        employment_type: member.employment?.employment_type || 'full_time',
        start_date: member.employment?.start_date || '',
        salary_range: member.employment?.salary_range || 'below_30k',
        family_members: member.family_members || [],
        skills: member.skills || []
      })
      
      if (member.profile_pic) {
        setProfilePicPreview(member.profile_pic)
      }
    }
  }, [member])

  const handleInputChange = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePic(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      family_members: [
        ...(prev.family_members || []),
        {
          family_member_name: '',
          relationship: 'spouse',
          dob: '',
          phone: '',
          email: ''
        }
      ]
    }))
  }

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      family_members: prev.family_members?.map((fm, i) => 
        i === index ? { ...fm, [field]: value } : fm
      ) || []
    }))
  }

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      family_members: prev.family_members?.filter((_, i) => i !== index) || []
    }))
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [
        ...(prev.skills || []),
        {
          skill_name: '',
          skill_level: 'beginner',
          category: 'technical'
        }
      ]
    }))
  }

  const updateSkill = (index: number, field: keyof MemberSkill, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      ) || []
    }))
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (member) {
        await updateMember(member.id, formData)
      } else {
        await addMember(formData)
      }
      onSave()
    } catch (error) {
      toast.error('Failed to save member')
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Add New Member'}</CardTitle>
        <CardDescription>
          {member ? 'Update member information' : 'Fill out the form to add a new member to the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value: any) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marital_status">Marital Status *</Label>
                  <Select value={formData.marital_status} onValueChange={(value: any) => handleInputChange('marital_status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="profile_pic">Profile Picture</Label>
                <Input
                  id="profile_pic"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />
                {profilePicPreview && (
                  <div className="mt-2">
                    <img
                      src={profilePicPreview}
                      alt="Profile preview"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Textarea
                    id="street_address"
                    value={formData.street_address}
                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_relationship">Relationship *</Label>
                  <Input
                    id="emergency_relationship"
                    value={formData.emergency_relationship}
                    onChange={(e) => handleInputChange('emergency_relationship', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_phone">Emergency Phone *</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_email">Emergency Email</Label>
                  <Input
                    id="emergency_email"
                    type="email"
                    value={formData.emergency_email}
                    onChange={(e) => handleInputChange('emergency_email', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={formData.employment_type} onValueChange={(value: any) => handleInputChange('employment_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salary_range">Salary Range</Label>
                  <Select value={formData.salary_range} onValueChange={(value: any) => handleInputChange('salary_range', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below_30k">Below $30k</SelectItem>
                      <SelectItem value="30k_50k">$30k - $50k</SelectItem>
                      <SelectItem value="50k_75k">$50k - $75k</SelectItem>
                      <SelectItem value="75k_100k">$75k - $100k</SelectItem>
                      <SelectItem value="above_100k">Above $100k</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-6">
              {/* Family Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Family Members</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>
                {formData.family_members?.map((familyMember, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Family Member {index + 1}</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFamilyMember(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={familyMember.family_member_name}
                          onChange={(e) => updateFamilyMember(index, 'family_member_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Select 
                          value={familyMember.relationship} 
                          onValueChange={(value: any) => updateFamilyMember(index, 'relationship', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={familyMember.dob}
                          onChange={(e) => updateFamilyMember(index, 'dob', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={familyMember.phone}
                          onChange={(e) => updateFamilyMember(index, 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Skills</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                {formData.skills?.map((skill, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Skill {index + 1}</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeSkill(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Skill Name</Label>
                        <Input
                          value={skill.skill_name}
                          onChange={(e) => updateSkill(index, 'skill_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Select 
                          value={skill.skill_level} 
                          onValueChange={(value: any) => updateSkill(index, 'skill_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select 
                          value={skill.category} 
                          onValueChange={(value: any) => updateSkill(index, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="hobby">Hobby</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {member ? 'Update Member' : 'Add Member'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}