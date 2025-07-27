import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description?: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  description 
}: StatCardProps) {
  const changeColorClass = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  }[changeType]

  return (
    <Card className="bg-gradient-card border-0 shadow-elegant hover:shadow-dashboard transition-smooth">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">{value}</p>
              {change && (
                <span className={`text-sm font-medium ${changeColorClass}`}>
                  {change}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="bg-gradient-primary p-3 rounded-xl shadow-glow">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </div>
    </Card>
  )
}