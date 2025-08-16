import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { DownloadSummaryButton } from "@/components/DownloadSummaryButton"
import { Activity, Cloud, Database, FileDown, Link as LinkIcon, Shield, SunMoon, Wrench } from "lucide-react"

interface SettingsProps {
  onNavigate?: (tab: string) => void
}

export function Settings({ onNavigate }: SettingsProps = {}) {
  const { toast } = useToast()
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined
  const imageUrl = import.meta.env.VITE_N8N_IMAGE_URL as string | undefined
  const [currentWebhookUrl, setCurrentWebhookUrl] = useState(webhookUrl || '')
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl || '')
  const [testing, setTesting] = useState(false)
  const [testingImage, setTestingImage] = useState(false)

  const handleTestWebhook = async () => {
    if (!currentWebhookUrl.trim()) {
      toast({ title: 'n8n not configured', description: 'Enter a webhook URL to test.', variant: 'destructive' })
      return
    }
    setTesting(true)
    try {
      const res = await fetch(currentWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PING', timestamp: new Date().toISOString() })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast({ title: 'n8n connection OK', description: 'Webhook responded successfully.' })
    } catch (e) {
      toast({ title: 'n8n test failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setTesting(false)
    }
  }

  const handleTestImageServer = async () => {
    if (!currentImageUrl.trim()) {
      toast({ title: 'Image server not configured', description: 'Enter an image server URL to test.', variant: 'destructive' })
      return
    }
    setTestingImage(true)
    try {
      const res = await fetch(`${currentImageUrl}?file=test.jpg`)
      if (res.status === 404) {
        toast({ title: 'Image server OK', description: 'Server responded (no test image found, which is expected).' })
      } else if (res.ok) {
        toast({ title: 'Image server OK', description: 'Server responded successfully.' })
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (e) {
      toast({ title: 'Image server test failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setTestingImage(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure app integrations, data, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integrations */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5" /> Integrations</CardTitle>
            <CardDescription>Manage external services connected to MemberHub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> n8n Webhook URL</Label>
                <Input 
                  value={currentWebhookUrl} 
                  onChange={(e) => setCurrentWebhookUrl(e.target.value)}
                  placeholder="Enter your n8n webhook URL"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleTestWebhook} disabled={testing} size="sm" className="flex items-center gap-2">
                    <Activity className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Testing…' : 'Test Connection'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Image Server URL</Label>
                <Input 
                  value={currentImageUrl} 
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                  placeholder="Enter your image server URL"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleTestImageServer} disabled={testingImage} size="sm" className="flex items-center gap-2">
                    <Activity className={`h-4 w-4 ${testingImage ? 'animate-spin' : ''}`} />
                    {testingImage ? 'Testing…' : 'Test Image Server'}
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">Enter your n8n URLs for testing. Changes are temporary for this session.</p>
              
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <a href="https://docs.n8n.io/integrations/core-nodes/n8n-nodes-base.webhook/" target="_blank" rel="noreferrer">
                  <Wrench className="h-4 w-4" /> n8n Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data & Reports */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Data & Reports</CardTitle>
            <CardDescription>Export comprehensive analytics and member data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Generate a ZIP with a PDF summary plus CSVs (members, age distribution, geography, join trends, professions, etc.).</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <DownloadSummaryButton />
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => onNavigate?.('analytics')}
              >
                <FileDown className="h-4 w-4" /> View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security & Privacy</CardTitle>
            <CardDescription>Basic recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Limit access to the n8n webhook URL and rotate it if exposed.</p>
            <p>• Avoid storing sensitive data in plain text fields.</p>
            <p>• Regularly export backups of your data.</p>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SunMoon className="h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Theme and layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Use the theme toggle in the header to switch between light/dark modes.</p>
            <Separator />
            <p>Sidebar can be collapsed on mobile using the menu button.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
