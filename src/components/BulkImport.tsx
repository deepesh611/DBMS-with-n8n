import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useMembers } from '@/hooks/use-members-new'
import { MemberFormData } from '@/types/member-new'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface BulkImportProps {
  onImportComplete?: () => void
}

export function BulkImport({ onImportComplete }: BulkImportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResults, setImportResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  
  const { toast } = useToast()
  const { addMember } = useMembers()

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        title: 'Mr',
        first_name: 'John',
        middle_name: 'David',
        last_name: 'Smith',
        family_name: 'Smith Family',
        dob: '1985-06-15',
        email: 'john.smith@email.com',
        family_status: 'Here',
        carsel: 'CAR001',
        local_address: '123 Main St, City, State',
        church_joining_date: '2020-01-15',
        baptism_date: '2020-02-20',
        baptism_church: 'First Baptist Church',
        baptism_country: 'USA',
        primary_phone: '+1234567890',
        whatsapp_phone: '+1234567890',
        emergency_phone: '+0987654321',
        origin_phone: '+1122334455',
        is_employed: 'true',
        company_name: 'Tech Corp',
        designation: 'Software Engineer',
        profession: 'Engineering',
        employment_start_date: '2022-03-01'
      },
      {
        title: 'Ms',
        first_name: 'Mary',
        middle_name: '',
        last_name: 'Johnson',
        family_name: 'Johnson Family',
        dob: '1990-12-03',
        email: 'mary.johnson@email.com',
        family_status: 'Origin Country',
        carsel: '',
        local_address: '456 Oak Ave, City, State',
        church_joining_date: '2021-05-10',
        baptism_date: '',
        baptism_church: '',
        baptism_country: '',
        primary_phone: '+1555666777',
        whatsapp_phone: '',
        emergency_phone: '+1888999000',
        origin_phone: '',
        is_employed: 'false',
        company_name: '',
        designation: '',
        profession: '',
        employment_start_date: ''
      }
    ]

    const csv = Papa.unparse(sampleData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'member_import_sample.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const validateMemberData = (data: any[]): { valid: MemberFormData[]; invalid: string[] } => {
    const valid: MemberFormData[] = []
    const invalid: string[] = []

    data.forEach((row, index) => {
      // Try to split name if provided
      const fullName = row.name || row.Name
      let first = row.first_name || row.FirstName || row.firstName
      let last = row.last_name || row.LastName || row.lastName
      if ((!first || !last) && typeof fullName === 'string') {
        const parts = fullName.trim().split(/\s+/)
        first = first || parts[0]
        last = last || parts.slice(1).join(' ')
      }

      const form: MemberFormData = {
        title: (row.title || row.Title || 'Mr') as any,
        first_name: first || '',
        middle_name: row.middle_name || row.MiddleName || '',
        last_name: last || '',
        family_name: row.family_name || row.FamilyName || '',
        dob: row.dob || row.DOB || row['Date of Birth'] || '',
        email: row.email || row.Email || '',
        family_status: (row.family_status || row.FamilyStatus || 'Here') as any,
        carsel: row.carsel || '',
        local_address: row.local_address || row.address || row.Address || '',
        church_joining_date: row.church_joining_date || row.joinDate || new Date().toISOString().split('T')[0],
        baptism_date: row.baptism_date || '',
        baptism_church: row.baptism_church || '',
        baptism_country: row.baptism_country || '',
        primary_phone: row.primary_phone || row.phone || row.Phone || '',
        whatsapp_phone: row.whatsapp_phone || '',
        emergency_phone: row.emergency_phone || row.emergencyContact || row['Emergency Contact'] || '',
        origin_phone: row.origin_phone || '',
        is_employed: ['true','1','yes','y','True','TRUE'].includes(String(row.is_employed).trim()),
        company_name: row.company_name || '',
        designation: row.designation || '',
        profession: row.profession || '',
        employment_start_date: row.employment_start_date || '',
        profile_pic: row.profile_pic || '',
        family_photo: row.family_photo || ''
      }

      if (!form.first_name || !form.last_name || !form.dob) {
        invalid.push(`Row ${index + 1}: Missing required fields (first_name, last_name, dob)`) 
      } else {
        valid.push(form)
      }
    })

    return { valid, invalid }
  }

  const processImport = async (data: MemberFormData[]) => {
    setIsLoading(true)
    setProgress(0)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      // Send all members in one batch to the webhook
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      
      if (webhookUrl) {
        setProgress(25)
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'BULK_CREATE_MEMBERS', 
            data: { members: data },
            timestamp: new Date().toISOString() 
          })
        })
        
        setProgress(50)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setProgress(75)
        
        if (result?.success) {
          results.success = data.length
          toast({
            title: "Bulk Import Complete",
            description: `Successfully imported ${data.length} members in batch`,
          })
        } else {
          throw new Error(result?.error || 'Bulk import failed')
        }
      } else {
        // Fallback: Add members one by one locally if no webhook
        for (let i = 0; i < data.length; i++) {
          try {
            await addMember(data[i])
            results.success++
          } catch (error) {
            results.failed++
            const name = `${data[i].first_name} ${data[i].last_name}`.trim()
            results.errors.push(`Failed to add ${name || 'member'}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
          setProgress(((i + 1) / data.length) * 100)
        }
        
        toast({
          title: "Import Complete (Local)",
          description: `Successfully imported ${results.success} members${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
        })
      }
    } catch (error) {
      console.error('Bulk import error:', error)
      results.failed = data.length
      results.errors.push(`Bulk import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      toast({
        title: "Import Failed",
        description: "Failed to import members. Please try again.",
        variant: "destructive",
      })
    }

    setProgress(100)
    setImportResults(results)
    setIsLoading(false)
    onImportComplete?.()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    try {
      setIsLoading(true)
      let data: any[] = []

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            data = results.data
            const { valid, invalid } = validateMemberData(data)
            
            if (invalid.length > 0) {
              setImportResults({
                success: 0,
                failed: invalid.length,
                errors: invalid
              })
              setIsLoading(false)
              return
            }
            
            processImport(valid)
          },
          error: (error) => {
            toast({
              title: "Error",
              description: `Failed to parse CSV: ${error.message}`,
              variant: "destructive",
            })
            setIsLoading(false)
          }
        })
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          data = XLSX.utils.sheet_to_json(worksheet)
          
          const { valid, invalid } = validateMemberData(data)
          
          if (invalid.length > 0) {
            setImportResults({
              success: 0,
              failed: invalid.length,
              errors: invalid
            })
            setIsLoading(false)
            return
          }
          
          processImport(valid)
        }
        reader.readAsArrayBuffer(file)
      } else {
        toast({
          title: "Error",
          description: "Please upload a CSV or XLSX file",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const convertGoogleSheetsUrl = (url: string): string => {
    // Convert Google Sheets URL to CSV export format
    if (url.includes('docs.google.com/spreadsheets')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      if (match) {
        const fileId = match[1]
        return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv`
      }
    }
    return url
  }

  const handleLinkImport = async () => {
    if (!linkUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Convert Google Sheets URL to exportable format
      const processedUrl = convertGoogleSheetsUrl(linkUrl)
      
      const response = await fetch(processedUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type') || ''
      const isCSV = processedUrl.toLowerCase().includes('.csv') || 
                   contentType.includes('text/csv') || 
                   processedUrl.includes('export?format=csv')
      
      if (isCSV) {
        const text = await response.text()
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const { valid, invalid } = validateMemberData(results.data)
            
            if (invalid.length > 0) {
              setImportResults({
                success: 0,
                failed: invalid.length,
                errors: invalid
              })
              setIsLoading(false)
              return
            }
            
            processImport(valid)
          },
          error: (error) => {
            toast({
              title: "Error",
              description: `Failed to parse CSV from URL: ${error.message}`,
              variant: "destructive",
            })
            setIsLoading(false)
          }
        })
      } else {
        // Try to parse as XLSX
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet)
        
        const { valid, invalid } = validateMemberData(data)
        
        if (invalid.length > 0) {
          setImportResults({
            success: 0,
            failed: invalid.length,
            errors: invalid
          })
          setIsLoading(false)
          return
        }
        
        processImport(valid)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch or process file from URL. Make sure the Google Sheet is shared publicly.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bulk Import Members</h1>
            <p className="text-muted-foreground">
              Required columns: first_name, last_name, dob. Optional: title, email, church_joining_date, phones, baptism and employment fields.
            </p>
          </div>
          <Button 
            onClick={downloadSampleCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="file" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload CSV or XLSX File
              </CardTitle>
              <CardDescription>
                Select a CSV or XLSX file containing member data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Choose File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your file has columns: <strong>first_name, last_name, dob</strong> (required). Optional: title, email, family_status, church_joining_date, local_address, carsel, primary_phone, whatsapp_phone, emergency_phone, origin_phone, baptism_*, employment_*, profile_pic, family_photo (Google Drive URLs).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Import from URL
              </CardTitle>
              <CardDescription>
                Enter a direct link to a CSV/XLSX file or Google Sheets URL
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">File URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/... or https://example.com/members.csv"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your file has columns: <strong>first_name, last_name, dob</strong> (required). Optional: title, email, family_status, church_joining_date, local_address, carsel, primary_phone, whatsapp_phone, emergency_phone, origin_phone, baptism_*, employment_*, profile_pic, family_photo (Google Drive URLs).
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleLinkImport} 
                disabled={isLoading || !linkUrl}
                className="w-full"
              >
                {isLoading ? "Importing..." : "Import from URL"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Importing members...</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResults.success > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResults.success}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Successfully Imported
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResults.failed}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Failed
                </div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600 dark:text-red-400">Errors:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}