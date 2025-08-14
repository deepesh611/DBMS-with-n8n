import { useState, useEffect } from "react"
import { useMembers } from "@/hooks/use-members-new"
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
  Cake,
  Briefcase
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
import { DownloadSummaryButton } from "@/components/DownloadSummaryButton"

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

export function Analytics() {
  const { members, stats, loading, fetchAllMembers } = useMembers()
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch members from database on component mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        await fetchAllMembers()
      } catch (error) {
        toast({
          title: "Warning",
          description: "Failed to fetch analytics data from database. Using local data.",
          variant: "destructive",
        })
      }
    }
    
    loadMembers()
  }, []) // Empty dependency array - runs only once on mount

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
      const address = member.local_address || ''
      const addressParts = address.split(',')
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
      const date = new Date(member.church_joining_date)
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

  // Employment statistics
  const getEmploymentStats = () => {
    const employed = members.filter(m => m.employment?.is_employed).length
    const professions = {}
    members.forEach(m => {
      if (m.employment?.profession) {
        professions[m.employment.profession] = (professions[m.employment.profession] || 0) + 1
      }
    })
    return {
      employed,
      unemployed: members.length - employed,
      topProfessions: Object.entries(professions)
        .map(([profession, count]) => ({ profession, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  }

  // Family status breakdown
  const getFamilyStatusStats = () => {
    const statusCounts = { 'Here': 0, 'Origin Country': 0 }
    members.forEach(m => {
      statusCounts[m.family_status] = (statusCounts[m.family_status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
  }

  // Phone type distribution
  const getPhoneStats = () => {
    const phoneTypes = { 'Primary': 0, 'WhatsApp': 0, 'Emergency': 0, 'Origin Country': 0 }
    members.forEach(m => {
      m.phones?.forEach(phone => {
        phoneTypes[phone.phone_type] = (phoneTypes[phone.phone_type] || 0) + 1
      })
    })
    return Object.entries(phoneTypes).map(([type, count]) => ({ type, count }))
  }

  const ageDistribution = getAgeDistribution()
  const geographicDistribution = getGeographicDistribution()
  const joinTrends = getJoinTrends()
  const upcomingBirthdays = getUpcomingBirthdays()
  const employmentStats = getEmploymentStats()
  const familyStatusStats = getFamilyStatusStats()
  const phoneStats = getPhoneStats()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into your member data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
            className="bg-gradient-primary hover:opacity-90 transition-smooth"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <DownloadSummaryButton variant="outline" />
        </div>
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
          <div id="chart-age" className="h-80">
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
            <div id="chart-geo" className="h-80">
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
                    labelStyle={{ fill: 'hsl(var(--foreground))' }}
                  >
                    {geographicDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
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
            <div id="chart-join" className="h-80">
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
                      {`${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{`${member.first_name} ${member.last_name}`.trim()}</p>
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

      {/* Employment & Family Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Employment Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Employed:</span>
                <span className="font-bold text-green-600">{employmentStats.employed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unemployed:</span>
                <span className="font-bold text-orange-600">{employmentStats.unemployed}</span>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Top Professions:</h4>
                {employmentStats.topProfessions.map(({ profession, count }) => (
                  <div key={profession} className="flex justify-between items-center py-1">
                    <span className="text-sm">{profession}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-elegant">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Family Status & Contact</h3>
            <div className="space-y-4">
              {familyStatusStats.map(({ status, count }) => (
                <div key={status} className="flex justify-between items-center">
                  <span>{status}:</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Phone Types:</h4>
                {phoneStats.map(({ type, count }) => (
                  <div key={type} className="flex justify-between items-center py-1">
                    <span className="text-sm">{type}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact Information Summary */}
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact & Membership Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {members.filter(m => (m.phones?.length || 0) > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Members with Phone
              </div>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {members.filter(m => m.email).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Members with Email
              </div>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {new Set(members.map(m => (m.local_address || '').split(',')[1]?.trim())).size}
              </div>
              <div className="text-sm text-muted-foreground">
                Unique Cities
              </div>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {members.filter(m => new Date(m.church_joining_date) >= new Date(new Date().setMonth(new Date().getMonth() - 1))).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Joined Last Month
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}