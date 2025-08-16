import { Button } from '@/components/ui/button'
import { DownloadCloud } from 'lucide-react'
import { useMembers } from '@/hooks/use-members-new'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { generateAndDownloadReport } from '@/lib/report'

interface DownloadSummaryButtonProps {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  includeCharts?: boolean
}

export function DownloadSummaryButton({ variant = 'default', size = 'default', includeCharts = true }: DownloadSummaryButtonProps) {
  const { members, stats, fetchAllMembers, fetchAllMembersDetailed, loading } = useMembers()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Fetch detailed member data for comprehensive report
      const detailedMembers = await fetchAllMembersDetailed()
      
      await generateAndDownloadReport({
        members: detailedMembers,
        stats,
        chartTargets: includeCharts ? [
          { id: 'chart-age', fileName: 'age-distribution' },
          { id: 'chart-geo', fileName: 'geographic-distribution' },
          { id: 'chart-join', fileName: 'join-trends' },
        ] : []
      })
      toast({ title: 'Enhanced Report Ready', description: 'A ZIP with detailed PDF + CSVs including phone numbers, employment, family data, and image references has been downloaded.' })
    } catch (e) {
      toast({ title: 'Failed to generate report', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} variant={variant} size={size} disabled={downloading || loading} className="whitespace-nowrap">
      <DownloadCloud className={`h-4 w-4 mr-2 ${downloading ? 'animate-pulse' : ''}`} />
      {downloading ? 'Fetching Details...' : 'Download Enhanced Summary'}
    </Button>
  )
}
