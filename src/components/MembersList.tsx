import { useState } from "react"
import { Search, Edit, Trash2, Mail, Phone } from "lucide-react"
import { useMembers } from "@/hooks/use-members"
import { Member } from "@/types/member"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MembersListProps {
  onEditMember: (member: Member) => void
}

export function MembersList({ onEditMember }: MembersListProps) {
  const { members, deleteMember, loading } = useMembers()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteMember = async () => {
    if (!memberToDelete) return

    try {
      await deleteMember(memberToDelete)
      toast({
        title: "Member deleted",
        description: "Member has been successfully removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  const getStatusBadge = (status: Member['status']) => {
    const variants = {
      active: "bg-success/10 text-success hover:bg-success/20",
      inactive: "bg-muted text-muted-foreground hover:bg-muted/80",
      pending: "bg-warning/10 text-warning hover:bg-warning/20"
    }
    return variants[status]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's members
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="bg-gradient-card border-0 shadow-elegant">
        <div className="p-6">
          <div className="grid gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-smooth gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {member.position} • {member.department}
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex items-center justify-between md:block md:text-right space-y-1">
                    <Badge className={getStatusBadge(member.status)}>
                      {member.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground md:mt-1">
                      Joined {new Date(member.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditMember(member)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setMemberToDelete(member.id)
                        setDeleteDialogOpen(true)
                      }}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No members found matching your search.</p>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member
              from your organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}