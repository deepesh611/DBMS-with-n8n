import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useMembers } from '@/hooks/use-members'
import { Member } from '@/types/member'
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

  const validateMemberData = (data: any[]): { valid: Omit<Member, 'id'>[]; invalid: string[] } => {
    const valid: Omit<Member, 'id'>[] = []
    const invalid: string[] = []

    data.forEach((row, index) => {
      const member = {
        name: row.name || row.Name || '',
        email: row.email || row.Email || '',
        phone: row.phone || row.Phone || '',
        dob: row.dob || row.DOB || row['Date of Birth'] || '',
        address: row.address || row.Address || '',
        emergencyContact: row.emergencyContact || row['Emergency Contact'] || row['Alt Contact'] || '',
        joinDate: row.joinDate || row['Join Date'] || new Date().toISOString().split('T')[0],
        profilePicUrl: row.profilePicUrl || row['Profile Picture'] || row['Photo URL'] || ''
      }

      if (!member.name || !member.email || !member.dob || !member.address || !member.emergencyContact) {
        invalid.push(`Row ${index + 1}: Missing required fields (name, email, dob, address, emergencyContact)`)
      } else if (!/\S+@\S+\.\S+/.test(member.email)) {
        invalid.push(`Row ${index + 1}: Invalid email format`)
      } else {
        valid.push(member)
      }
    })

    return { valid, invalid }
  }

  const processImport = async (data: Omit<Member, 'id'>[]) => {
    setIsLoading(true)
    setProgress(0)
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < data.length; i++) {
      try {
        await addMember(data[i])
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to add ${data[i].name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      setProgress(((i + 1) / data.length) * 100)
    }

    setImportResults(results)
    setIsLoading(false)
    
    if (results.success > 0) {
      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.success} members${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
      })
      onImportComplete?.()
    }
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
      const response = await fetch(linkUrl)
      const text = await response.text()
      
      const isCSV = linkUrl.toLowerCase().includes('.csv') || response.headers.get('content-type')?.includes('text/csv')
      
      if (isCSV) {
        Papa.parse(text, {
          header: true,
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
        description: "Failed to fetch or process file from URL",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Bulk Import Members</h1>
        <p className="text-muted-foreground">
          Import multiple members from CSV or XLSX files. Required columns: name, email, phone, dob, address, emergencyContact. 
          Optional: joinDate, profilePicUrl.
        </p>
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
                  Make sure your file has columns: <strong>name, email, phone, dob, address, emergencyContact</strong> (all required), 
                  plus optional: joinDate, profilePicUrl
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
                Enter a direct link to a CSV or XLSX file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">File URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/members.csv"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
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