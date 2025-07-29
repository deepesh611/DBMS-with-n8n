import { useState, useEffect } from "react"
import { useMembers } from "@/hooks/use-members"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/StatCard"
import { 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  RefreshCw,
  TrendingUp,
  UserCheck,
  Cake
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { useToast } from "@/hooks/use-toast"

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

export function Analytics() {
  const { members, stats, loading, fetchAllMembers } = useMembers()
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchAllMembers()
      toast({
        title: "Data refreshed",
        description: "Member data has been updated from the database.",
      })
    } catch (error) {
      toast({
        title: "Refresh failed", 
        description: "Using local data. Check your n8n webhook configuration.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Age distribution analysis
  const getAgeDistribution = () => {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    }

    members.forEach(member => {
      const birthYear = new Date(member.dob).getFullYear()
      const age = new Date().getFullYear() - birthYear
      
      if (age >= 18 && age <= 25) ageGroups['18-25']++
      else if (age >= 26 && age <= 35) ageGroups['26-35']++
      else if (age >= 36 && age <= 45) ageGroups['36-45']++
      else if (age >= 46 && age <= 55) ageGroups['46-55']++
      else if (age > 55) ageGroups['55+']++
    })

    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / members.length) * 100)
    }))
  }

  // Geographic distribution (by city from address)
  const getGeographicDistribution = () => {
    const cities: { [key: string]: number } = {}
    
    members.forEach(member => {
      // Extract city from address (assuming format includes city)
      const addressParts = member.address.split(',')
      const city = addressParts[1]?.trim() || 'Unknown'
      cities[city] = (cities[city] || 0) + 1
    })

    return Object.entries(cities)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 cities
  }

  // Join date trends (monthly)
  const getJoinTrends = () => {
    const monthlyData: { [key: string]: number } = {}
    
    members.forEach(member => {
      const date = new Date(member.joinDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Upcoming birthdays (next 30 days)
  const getUpcomingBirthdays = () => {
    const today = new Date()
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return members.filter(member => {
      const birthDate = new Date(member.dob)
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      
      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      
      return thisYearBirthday >= today && thisYearBirthday <= nextMonth
    }).sort((a, b) => {
      const aDate = new Date(a.dob)
      const bDate = new Date(b.dob)
      const aThisYear = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate())
      const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate())
      
      if (aThisYear < today) aThisYear.setFullYear(today.getFullYear() + 1)
      if (bThisYear < today) bThisYear.setFullYear(today.getFullYear() + 1)
      
      return aThisYear.getTime() - bThisYear.getTime()
    })
  }

  const ageDistribution = getAgeDistribution()
  const geographicDistribution = getGeographicDistribution()
  const joinTrends = getJoinTrends()
  const upcomingBirthdays = getUpcomingBirthdays()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into your member data
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
          className="bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Overview Stats */}
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
          change="100%"
          changeType="positive"
          icon={UserCheck}
          description="Currently active"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={Calendar}
          description="Joined this month"
        />
        <StatCard
          title="Upcoming Birthdays"
          value={upcomingBirthdays.length}
          icon={Cake}
          description="Next 30 days"
        />
      </div>

      {/* Age Distribution */}
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Age Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ city, count }) => `${city} (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {geographicDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Join Trends */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Member Join Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={joinTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cake className="h-5 w-5" />
              Upcoming Birthdays (Next 30 Days)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBirthdays.map((member) => {
                const birthDate = new Date(member.dob)
                const today = new Date()
                const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
                
                if (thisYearBirthday < today) {
                  thisYearBirthday.setFullYear(today.getFullYear() + 1)
                }
                
                const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={member.id} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {thisYearBirthday.toLocaleDateString()} ({daysUntil === 0 ? 'Today!' : `${daysUntil} days`})
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Contact Information Summary */}
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {members.filter(m => m.phone).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Members with Phone
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {members.filter(m => m.emergencyContact).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Emergency Contacts
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {new Set(members.map(m => m.address.split(',')[1]?.trim())).size}
              </div>
              <div className="text-sm text-muted-foreground">
                Unique Cities
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}