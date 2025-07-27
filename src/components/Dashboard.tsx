import { Users, UserCheck, UserPlus, Building2 } from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { useMembers } from "@/hooks/use-members"
import { Card } from "@/components/ui/card"

export function Dashboard() {
  const { stats, members } = useMembers()

  const recentMembers = members
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your organization's membership
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          description="All registered members"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          change={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}%`}
          changeType="positive"
          icon={UserCheck}
          description="Currently active"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          change="+12%"
          changeType="positive"
          icon={UserPlus}
          description="Joined this month"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
          description="Active departments"
        />
      </div>

      {/* Recent Members */}
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Members</h3>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-secondary/50 rounded-lg gap-3">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.position} • {member.department}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:block md:text-right">
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === 'active' 
                      ? 'bg-success/10 text-success'
                      : member.status === 'pending'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}