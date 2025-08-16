import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useMembers } from '@/hooks/use-members-new'
import { Phone, Mail, MapPin, Briefcase, Calendar, Users } from 'lucide-react'
import type { Member } from '@/types/member-new'

interface MemberDetailModalProps {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberDetailModal({ member, open, onOpenChange }: MemberDetailModalProps) {
  const { fetchMemberDetails } = useMembers()
  const [detailedMember, setDetailedMember] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadDetails = async () => {
    if (!member) return
    setLoading(true)
    // Just use the basic member data directly
    setDetailedMember(member)
    setLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && member) {
      setDetailedMember(null) // Reset to force fresh fetch
      loadDetails()
    }
    if (!newOpen) {
      setDetailedMember(null)
    }
    onOpenChange(newOpen)
  }

  if (!member) return null

  // Show member data (basic data from members list)
  const data = detailedMember || member
  const phoneNumbers = {}
  
  // Extract phone numbers from phones array
  if (data?.phones) {
    data.phones.forEach((phone: any) => {
      phoneNumbers[phone.phone_type] = phone.phone_number
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              {member.first_name[0]}{member.last_name[0]}
            </div>
            {member.title} {member.first_name} {member.middle_name} {member.last_name}
          </DialogTitle>
        </DialogHeader>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Images */}
            {(data.profile_pic || data.family_photo) && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {data.profile_pic && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Profile Picture</p>
                        <img 
                          src={`${import.meta.env.VITE_N8N_IMAGE_URL}?file=${data.profile_pic.replace('/uploads/', '')}`}
                          alt="Profile"
                          className="max-w-32 max-h-32 object-contain rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      </div>
                    )}
                    {data.family_photo && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Family Photo</p>
                        <img 
                          src={`${import.meta.env.VITE_N8N_IMAGE_URL}?file=${data.family_photo.replace('/uploads/', '')}`}
                          alt="Family"
                          className="max-w-32 max-h-32 object-contain rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Family Name:</span>
                    <p className="font-medium">{data.family_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium">{data.dob ? new Date(data.dob).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Family Status:</span>
                    <Badge variant={data.family_status === 'Here' ? 'default' : 'secondary'}>
                      {data.family_status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Church Joining:</span>
                    <p className="font-medium">{data.church_joining_date ? new Date(data.church_joining_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{data.email}</span>
                  </div>
                )}
                {Object.entries(phoneNumbers).map(([type, number]) => (
                  <div key={type} className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground w-20">{type}:</span>
                    <span>{number}</span>
                  </div>
                ))}
                {data.local_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{data.local_address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment */}
            {data.employment?.is_employed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Employment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Company:</span>
                      <p className="font-medium">{data.employment.company_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Designation:</span>
                      <p className="font-medium">{data.employment.designation}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Profession:</span>
                      <p className="font-medium">{data.employment.profession}</p>
                    </div>
                    {data.employment.employment_start_date && (
                      <div>
                        <span className="text-sm text-muted-foreground">Start Date:</span>
                        <p className="font-medium">{new Date(data.employment.employment_start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Baptism Info */}
            {(data.baptism_date || data.baptism_church || data.baptism_country) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Baptism Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {data.baptism_date && (
                      <div>
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <p className="font-medium">{new Date(data.baptism_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {data.baptism_church && (
                      <div>
                        <span className="text-sm text-muted-foreground">Church:</span>
                        <p className="font-medium">{data.baptism_church}</p>
                      </div>
                    )}
                    {data.baptism_country && (
                      <div>
                        <span className="text-sm text-muted-foreground">Country:</span>
                        <p className="font-medium">{data.baptism_country}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Family Members */}
            {detailedMember?.family?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Family Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detailedMember.family.map((familyMember: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                        <span>{familyMember.name}</span>
                        <Badge variant="outline">{familyMember.relationship}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}