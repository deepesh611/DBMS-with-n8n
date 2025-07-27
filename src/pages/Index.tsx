import { useState } from "react"
import { Member } from "@/types/member"
import { Sidebar } from "@/components/Sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Dashboard } from "@/components/Dashboard"
import { MembersList } from "@/components/MembersList"
import { MemberForm } from "@/components/MemberForm"

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setActiveTab("add-member")
  }

  const handleSaveMember = () => {
    setEditingMember(null)
    setActiveTab("members")
  }

  const handleCancelEdit = () => {
    setEditingMember(null)
    setActiveTab("members")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "members":
        return <MembersList onEditMember={handleEditMember} />
      case "add-member":
        return (
          <MemberForm
            member={editingMember}
            onSave={handleSaveMember}
            onCancel={handleCancelEdit}
          />
        )
      case "analytics":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Detailed analytics coming soon...</p>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-gradient-card border-b shadow-elegant p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="font-semibold text-lg capitalize">
              {activeTab.replace("-", " ")}
            </h2>
          </div>
          <ThemeToggle />
        </header>
        
        <main className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
