import JSZip from 'jszip'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Member, MemberStats } from '@/types/member-new'

export type ChartCaptureTarget = {
  id: string
  fileName: string
}

function toCSV(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: any) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  return [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n')
}

function ageFromDOB(dob: string): number {
  const d = new Date(dob)
  const diff = Date.now() - d.getTime()
  const ageDate = new Date(diff)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export async function generateAndDownloadReport(params: {
  members: Member[]
  stats: MemberStats
  chartTargets?: ChartCaptureTarget[]
}): Promise<void> {
  const { members, stats, chartTargets = [] } = params

  // Analyses
  const ageGroups: Record<string, number> = { '0-17': 0, '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '55+': 0 }
  const geoMap: Record<string, number> = {}
  const joinMonthly: Record<string, number> = {}
  const familyStatus: Record<string, number> = { Here: 0, 'Origin Country': 0 }
  const phoneTypes: Record<string, number> = { Primary: 0, WhatsApp: 0, Emergency: 0, 'Origin Country': 0 }
  const professionCounts: Record<string, number> = {}

  const upcomingBirthdays: { id: number | string; name: string; date: string }[] = []
  const today = new Date()
  const next30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  members.forEach(m => {
    // Age
    const age = ageFromDOB(m.dob)
    if (age < 18) ageGroups['0-17']++
    else if (age <= 25) ageGroups['18-25']++
    else if (age <= 35) ageGroups['26-35']++
    else if (age <= 45) ageGroups['36-45']++
    else if (age <= 55) ageGroups['46-55']++
    else ageGroups['55+']++

    // Geo (city heuristics from local_address)
    const city = (m.local_address?.split(',')[1]?.trim() || 'Unknown')
    geoMap[city] = (geoMap[city] || 0) + 1

    // Join trends
    const jd = new Date(m.church_joining_date)
    if (!isNaN(jd.getTime())) {
      const key = `${jd.getFullYear()}-${String(jd.getMonth() + 1).padStart(2, '0')}`
      joinMonthly[key] = (joinMonthly[key] || 0) + 1
    }

    // Family status
    familyStatus[m.family_status] = (familyStatus[m.family_status] || 0) + 1

    // Phones
    m.phones?.forEach(p => {
      phoneTypes[p.phone_type] = (phoneTypes[p.phone_type] || 0) + 1
    })

    // Profession
    const prof = m.employment?.profession
    if (prof) professionCounts[prof] = (professionCounts[prof] || 0) + 1

    // Upcoming birthdays
    const dob = new Date(m.dob)
    const birthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
    if (birthday < today) birthday.setFullYear(today.getFullYear() + 1)
    if (birthday >= today && birthday <= next30) {
      upcomingBirthdays.push({ id: m.id!, name: `${m.first_name} ${m.last_name}`.trim(), date: birthday.toISOString().slice(0, 10) })
    }
  })

  const ageCSV = toCSV(['range', 'count'], Object.entries(ageGroups).map(([k, v]) => [k, v]))
  const geoCSV = toCSV(['city', 'count'], Object.entries(geoMap).map(([k, v]) => [k, v]))
  const joinCSV = toCSV(['month', 'count'], Object.entries(joinMonthly).sort((a,b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, v]))
  const familyCSV = toCSV(['family_status', 'count'], Object.entries(familyStatus).map(([k, v]) => [k, v]))
  const phoneCSV = toCSV(['phone_type', 'count'], Object.entries(phoneTypes).map(([k, v]) => [k, v]))
  const professionCSV = toCSV(['profession', 'count'], Object.entries(professionCounts).map(([k, v]) => [k, v]))

  const membersCSV = toCSV(
    [
      'id','title','first_name','middle_name','last_name','family_name','dob','email','family_status','carsel','local_address','church_joining_date','primary_phone','whatsapp_phone','emergency_phone','origin_phone','profession'
    ],
    members.map(m => [
      m.id ?? '', m.title ?? '', m.first_name ?? '', m.middle_name ?? '', m.last_name ?? '', m.family_name ?? '', m.dob ?? '', m.email ?? '', m.family_status ?? '', m.carsel ?? '', m.local_address ?? '', m.church_joining_date ?? '',
      m.phones?.find(p => p.phone_type === 'Primary')?.phone_number || '',
      m.phones?.find(p => p.phone_type === 'WhatsApp')?.phone_number || '',
      m.phones?.find(p => p.phone_type === 'Emergency')?.phone_number || '',
      m.phones?.find(p => p.phone_type === 'Origin Country')?.phone_number || '',
      m.employment?.profession || ''
    ])
  )

  const summaryJSON = JSON.stringify({
    generatedAt: new Date().toISOString(),
    totals: stats,
    analyses: {
      ageGroups,
      geographicDistribution: geoMap,
      joinTrends: joinMonthly,
      familyStatus,
      phoneTypes,
      professionCounts,
      upcomingBirthdays
    }
  }, null, 2)

  // Prepare ZIP
  const zip = new JSZip()
  zip.file('summary.json', summaryJSON)
  zip.file('members.csv', membersCSV)
  zip.folder('analyses')?.file('age_distribution.csv', ageCSV)
  zip.folder('analyses')?.file('geographic_distribution.csv', geoCSV)
  zip.folder('analyses')?.file('join_trends.csv', joinCSV)
  zip.folder('analyses')?.file('family_status.csv', familyCSV)
  zip.folder('analyses')?.file('phone_types.csv', phoneCSV)
  zip.folder('analyses')?.file('professions.csv', professionCSV)

  // Create PDF
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin

  const addHeading = (text: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(text, margin, y)
    y += 20
  }
  const addText = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(text, 515)
    doc.text(lines, margin, y)
    y += lines.length * 14 + 6
  }
  const ensureSpace = (needed = 80) => {
    if (y > 780 - needed) { doc.addPage(); y = margin }
  }

  addHeading('MemberHub Analytics Summary')
  addText(`Generated: ${new Date().toLocaleString()}`)
  addText(`Totals: Total Members ${stats.totalMembers} | Active ${stats.activeMembers} | New This Month ${stats.newThisMonth} | Departments ${stats.departments}`)

  addHeading('Key Analyses')
  addText(`Family Status: Here ${familyStatus['Here'] || 0}, Origin Country ${familyStatus['Origin Country'] || 0}`)
  addText(`Top Cities: ${Object.entries(geoMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,n])=>`${c}(${n})`).join(', ')}`)
  addText(`Top Professions: ${Object.entries(professionCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([p,n])=>`${p}(${n})`).join(', ') || 'N/A'}`)
  addText(`Upcoming Birthdays (next 30 days): ${upcomingBirthdays.slice(0,10).map(b=>`${b.name} ${b.date}`).join(', ') || 'None'}`)

  // Capture charts if present and add to PDF and ZIP
  if (chartTargets.length) {
    addHeading('Charts')
    for (const t of chartTargets) {
      ensureSpace(260)
      try {
        const el = document.getElementById(t.id)
        if (el) {
          const canvas = await html2canvas(el as HTMLElement, { backgroundColor: null, scale: 2 })
          const imgData = canvas.toDataURL('image/png')
          doc.addImage(imgData, 'PNG', margin, y, 515, 240)
          y += 250
          zip.folder('charts')?.file(`${t.fileName}.png`, imgData.split(',')[1], { base64: true })
        }
      } catch (e) {
        // ignore capture errors
      }
    }
  }

  // Put PDF into ZIP
  const pdfBlob = doc.output('blob')
  const pdfArrayBuffer = await pdfBlob.arrayBuffer()
  zip.file('summary.pdf', pdfArrayBuffer)

  const content = await zip.generateAsync({ type: 'blob' })
  const fileName = `memberhub-report-${new Date().toISOString().replace(/[:T]/g,'-').slice(0,16)}.zip`
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
