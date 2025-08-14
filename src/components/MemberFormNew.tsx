import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMembers } from '@/hooks/use-members-new'
import type { Member, MemberFormData, Title } from '@/types/member-new'
import { toast } from 'sonner'

interface MemberFormNewProps {
  member?: Member | null
  onSave: () => void
  onCancel: () => void
}

const titles: Title[] = ['Mr', 'Ms', 'Mrs', 'Dr']

export function MemberFormNew({ member, onSave, onCancel }: MemberFormNewProps) {
  const { addMember, updateMember, loading } = useMembers()
  const [step, setStep] = useState<number>(1)

  const [formData, setFormData] = useState<MemberFormData>({
    // Step 1
    title: 'Mr',
    first_name: '',
    middle_name: '',
    last_name: '',
    family_name: '',
    dob: '',
    email: '',
    family_status: 'Here',
    carsel: '',
    local_address: '',
    church_joining_date: new Date().toISOString().split('T')[0],
    // Step 2
    baptism_date: '',
    baptism_church: '',
    baptism_country: '',
    // Step 3
    primary_phone: '',
    whatsapp_phone: '',
    emergency_phone: '',
    origin_phone: '',
    // Step 4
    is_employed: false,
    company_name: '',
    designation: '',
    profession: '',
    employment_start_date: '',
    // Step 5
    is_married: false,
    spouse: undefined,
    children: [],
    // Images
    profile_pic: '',
    family_photo: ''
  })

  const [profilePreview, setProfilePreview] = useState<string>('')
  const [familyPreview, setFamilyPreview] = useState<string>('')

  // Populate form if editing existing member
  useEffect(() => {
    if (member) {
      const primaryPhone = member.phones.find(p => p.phone_type === 'Primary')?.phone_number || ''
      const whatsapp = member.phones.find(p => p.phone_type === 'WhatsApp')?.phone_number || ''
      const emergency = member.phones.find(p => p.phone_type === 'Emergency')?.phone_number || ''
      const origin = member.phones.find(p => p.phone_type === 'Origin Country')?.phone_number || ''

      setFormData(prev => ({
        ...prev,
        title: member.title,
        first_name: member.first_name,
        middle_name: member.middle_name,
        last_name: member.last_name,
        family_name: member.family_name,
        dob: member.dob,
        email: member.email,
        family_status: member.family_status,
        carsel: member.carsel,
        local_address: member.local_address,
        church_joining_date: member.church_joining_date,
        baptism_date: member.baptism_date,
        baptism_church: member.baptism_church,
        baptism_country: member.baptism_country,
        primary_phone: primaryPhone,
        whatsapp_phone: whatsapp,
        emergency_phone: emergency,
        origin_phone: origin,
        is_employed: !!member.employment?.is_employed,
        company_name: member.employment?.company_name || '',
        designation: member.employment?.designation || '',
        profession: member.employment?.profession || '',
        employment_start_date: member.employment?.employment_start_date || '',
        profile_pic: member.profile_pic || '',
        family_photo: member.family_photo || ''
      }))

      if (member.profile_pic) setProfilePreview(member.profile_pic)
      if (member.family_photo) setFamilyPreview(member.family_photo)
    }
  }, [member])

  const handleChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await toBase64(file)
    setProfilePreview(b64)
    handleChange('profile_pic', b64)
  }

  const handleFamilyPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await toBase64(file)
    setFamilyPreview(b64)
    handleChange('family_photo', b64)
  }

  const addChild = () => {
    const next = [...(formData.children || []), { title: 'Mr' as Title, first_name: '', last_name: '', dob: '', email: '' }]
    handleChange('children', next)
  }

  const updateChild = (index: number, field: 'title' | 'first_name' | 'last_name' | 'dob' | 'email', value: string) => {
    const next = (formData.children || []).map((c, i) => i === index ? { ...c, [field]: value } : c)
    handleChange('children', next)
  }

  const removeChild = (index: number) => {
    const next = (formData.children || []).filter((_, i) => i !== index)
    handleChange('children', next)
  }

  const nextStep = () => {
    // Validate required fields on step 1
    if (step === 1) {
      if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email?.trim()) {
        toast.error('First name, last name, and email are required')
        return
      }
    }
    setStep(s => Math.min(5, s + 1))
  }
  const prevStep = () => setStep(s => Math.max(1, s - 1))

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

  const StepNav = () => (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">Step {step} of 5</div>
      <div className="space-x-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
            Previous
          </Button>
        )}
        {step < 5 ? (
          <Button type="button" onClick={nextStep} disabled={loading}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Add New Member'}</CardTitle>
        <CardDescription>Fill out the form to {member ? 'update' : 'add'} a member</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <StepNav />

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Select value={formData.title} onValueChange={(v: Title) => handleChange('title', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>First Name *</Label>
                <Input value={formData.first_name} onChange={e => handleChange('first_name', e.target.value)} required />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input value={formData.middle_name || ''} onChange={e => handleChange('middle_name', e.target.value)} />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={formData.last_name} onChange={e => handleChange('last_name', e.target.value)} required />
              </div>
              <div>
                <Label>Family Name</Label>
                <Input value={formData.family_name || ''} onChange={e => handleChange('family_name', e.target.value)} />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} required />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} required />
              </div>
              <div>
                <Label>Family Status</Label>
                <Select value={formData.family_status} onValueChange={(v: any) => handleChange('family_status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Here">Here</SelectItem>
                    <SelectItem value="Origin Country">Origin Country</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Local Address</Label>
                <Textarea rows={3} value={formData.local_address || ''} onChange={e => handleChange('local_address', e.target.value)} />
              </div>
              <div>
                <Label>Carsel</Label>
                <Input value={formData.carsel || ''} onChange={e => handleChange('carsel', e.target.value)} />
              </div>
              <div>
                <Label>Church Joining Date</Label>
                <Input type="date" value={formData.church_joining_date} onChange={e => handleChange('church_joining_date', e.target.value)} required />
              </div>
              <div>
                <Label>Profile Picture</Label>
                <Input type="file" accept="image/*" onChange={handleProfilePicChange} />
                {profilePreview && <img src={profilePreview} alt="Profile" className="mt-2 w-20 h-20 rounded-md object-cover" />}
              </div>
              <div>
                <Label>Family Photo</Label>
                <Input type="file" accept="image/*" onChange={handleFamilyPhotoChange} />
                {familyPreview && <img src={familyPreview} alt="Family" className="mt-2 w-20 h-20 rounded-md object-cover" />}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Baptism Date</Label>
                <Input type="date" value={formData.baptism_date || ''} onChange={e => handleChange('baptism_date', e.target.value)} />
              </div>
              <div>
                <Label>Baptism Church</Label>
                <Input value={formData.baptism_church || ''} onChange={e => handleChange('baptism_church', e.target.value)} />
              </div>
              <div>
                <Label>Baptism Country</Label>
                <Input value={formData.baptism_country || ''} onChange={e => handleChange('baptism_country', e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Primary Phone</Label>
                <Input value={formData.primary_phone || ''} onChange={e => handleChange('primary_phone', e.target.value)} />
              </div>
              <div>
                <Label>WhatsApp Phone</Label>
                <Input value={formData.whatsapp_phone || ''} onChange={e => handleChange('whatsapp_phone', e.target.value)} />
              </div>
              <div>
                <Label>Emergency Phone</Label>
                <Input value={formData.emergency_phone || ''} onChange={e => handleChange('emergency_phone', e.target.value)} />
              </div>
              <div>
                <Label>Origin Country Phone</Label>
                <Input value={formData.origin_phone || ''} onChange={e => handleChange('origin_phone', e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex items-center gap-3">
                <input id="is_employed" type="checkbox" checked={formData.is_employed} onChange={e => handleChange('is_employed', e.target.checked)} />
                <Label htmlFor="is_employed">Is Employed</Label>
              </div>
              {formData.is_employed && (
                <>
                  <div>
                    <Label>Company Name</Label>
                    <Input value={formData.company_name || ''} onChange={e => handleChange('company_name', e.target.value)} />
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Input value={formData.designation || ''} onChange={e => handleChange('designation', e.target.value)} />
                  </div>
                  <div>
                    <Label>Profession</Label>
                    <Input value={formData.profession || ''} onChange={e => handleChange('profession', e.target.value)} />
                  </div>
                  <div>
                    <Label>Employment Start Date</Label>
                    <Input type="date" value={formData.employment_start_date || ''} onChange={e => handleChange('employment_start_date', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input id="is_married" type="checkbox" checked={!!formData.is_married} onChange={e => handleChange('is_married', e.target.checked)} />
                <Label htmlFor="is_married">Married</Label>
              </div>

              {formData.is_married && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 font-medium">Spouse Details</div>
                  <div>
                    <Label>Title</Label>
                    <Select value={formData.spouse?.title || 'Ms'} onValueChange={(v: Title) => handleChange('spouse', { ...(formData.spouse || { title: 'Ms', first_name: '', last_name: '' }), title: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {titles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>First Name</Label>
                    <Input value={formData.spouse?.first_name || ''} onChange={e => handleChange('spouse', { ...(formData.spouse || { title: 'Ms' }), first_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Middle Name</Label>
                    <Input value={formData.spouse?.middle_name || ''} onChange={e => handleChange('spouse', { ...(formData.spouse || { title: 'Ms' }), middle_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={formData.spouse?.last_name || ''} onChange={e => handleChange('spouse', { ...(formData.spouse || { title: 'Ms' }), last_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input type="date" value={formData.spouse?.dob || ''} onChange={e => handleChange('spouse', { ...(formData.spouse || { title: 'Ms' }), dob: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.spouse?.email || ''} onChange={e => handleChange('spouse', { ...(formData.spouse || { title: 'Ms' }), email: e.target.value })} required />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="font-medium">Children</div>
                {(formData.children || []).map((child, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                      <Label>Title</Label>
                      <Select value={child.title} onValueChange={(v: Title) => updateChild(idx, 'title', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {titles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>First Name *</Label>
                      <Input value={child.first_name} onChange={e => updateChild(idx, 'first_name', e.target.value)} required />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input value={child.last_name} onChange={e => updateChild(idx, 'last_name', e.target.value)} required />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={child.email || ''} onChange={e => updateChild(idx, 'email', e.target.value)} required />
                    </div>
                    <div>
                      <Label>DOB</Label>
                      <Input type="date" value={child.dob || ''} onChange={e => updateChild(idx, 'dob', e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => removeChild(idx)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addChild}>
                  Add Child
                </Button>
              </div>
            </div>
          )}

          <StepNav />
        </form>
      </CardContent>
    </Card>
  )
}
