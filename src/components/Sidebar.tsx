import { Users, BarChart3, UserPlus, Settings, Home, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "members", label: "Members", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "add-member", label: "Add Member", icon: UserPlus },
  { id: "bulk-import", label: "Bulk Import", icon: Upload },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="bg-gradient-card border-r shadow-elegant h-full w-64 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          MemberHub
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Organization Management</p>
      </div>
      
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-medium transition-smooth",
                activeTab === item.id 
                  ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                  : "hover:bg-secondary/50"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}