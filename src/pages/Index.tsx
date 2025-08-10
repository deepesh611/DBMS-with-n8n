import { useState } from "react"
import { Member } from "@/types/member-new"
import { Sidebar } from "@/components/Sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Dashboard } from "@/components/Dashboard"
import { MembersList } from "@/components/MembersList"
import { MemberFormNew } from "@/components/MemberFormNew"
import { BulkImport } from "@/components/BulkImport"
import { Analytics } from "@/components/Analytics"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          <MemberFormNew
            member={editingMember}
            onSave={handleSaveMember}
            onCancel={handleCancelEdit}
          />
        )
      case "bulk-import":
        return <BulkImport onImportComplete={() => setActiveTab("members")} />
      case "analytics":
        return <Analytics />
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
    <div className="min-h-screen bg-background flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab)
            setSidebarOpen(false) // Close sidebar on mobile after selection
          }} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gradient-card border-b shadow-elegant p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-lg capitalize">
              {activeTab.replace("-", " ")}
            </h2>
          </div>
          <ThemeToggle />
        </header>
        
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
