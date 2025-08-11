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
  const { members, stats, fetchAllMembers, loading } = useMembers()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Try to refresh first for most up-to-date data
      try { await fetchAllMembers() } catch {}

      await generateAndDownloadReport({
        members,
        stats,
        chartTargets: includeCharts ? [
          { id: 'chart-age', fileName: 'age-distribution' },
          { id: 'chart-geo', fileName: 'geographic-distribution' },
          { id: 'chart-join', fileName: 'join-trends' },
        ] : []
      })
      toast({ title: 'Report ready', description: 'A ZIP with PDF + CSVs has been downloaded.' })
    } catch (e) {
      toast({ title: 'Failed to generate report', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} variant={variant} size={size} disabled={downloading || loading} className="whitespace-nowrap">
      <DownloadCloud className={`h-4 w-4 mr-2 ${downloading ? 'animate-pulse' : ''}`} />
      {downloading ? 'Preparing...' : 'Download Summary'}
    </Button>
  )
}
