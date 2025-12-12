/**
 * Bulk PDF Download
 * Downloads all school PDFs as a ZIP file
 */

import { loadPdfMake } from './loadPdfMake'
import { buildSchoolReportPdf } from './buildSchoolReportPdf'
import { pdfMakeToBlob } from './pdfMakeToBlob'
import { sanitiseDocDefinition } from './sanitiseDocDefinition'
import { PdfLang } from './translations'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import schoolsData from '../data/schools.json'
import scoreRowsData from '../data/score_rows.json'
import aggregatesData from '../data/aggregates.json'

interface School {
  school_code: string
  school_name: string
}

interface ScoreRow {
  school_code: string
  grade_level: number
  subject: string
  competency_name: string
  score_10: number
  priority_band: 'High' | 'Medium' | 'Low'
}

interface Aggregates {
  school_code: string
  overall_avg: number | null
  subject_avg_map: {
    English: number | null
    Mathematics: number | null
    Science: number | null
    'Social Science': number | null
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}

export async function downloadAllPdfs(
  lang: PdfLang = 'en',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const schools = schoolsData as School[]
  const allScoreRows = scoreRowsData as ScoreRow[]
  const allAggregates = aggregatesData as Aggregates[]

  const zip = new JSZip()
  const failures: string[] = []

  // Dynamically load pdfMake once for all schools
  const pdfMake = await loadPdfMake()

  // Process schools sequentially
  for (let i = 0; i < schools.length; i++) {
    const school = schools[i]

    try {
      // Report progress
      if (onProgress) {
        onProgress(i + 1, schools.length)
      }

      // Get school data
      const schoolScoreRows = allScoreRows.filter((row) => row.school_code === school.school_code)
      const schoolAggregates =
        allAggregates.find((a) => a.school_code === school.school_code) || null

      // Build document definition
      const docDefinition = buildSchoolReportPdf({
        school,
        aggregates: schoolAggregates,
        scoreRows: schoolScoreRows,
        lang,
      })

      // Sanitise docDefinition to prevent crashes
      const safeDoc = sanitiseDocDefinition(docDefinition)

      // Generate PDF blob with timeout
      const blob = await pdfMakeToBlob(pdfMake, safeDoc, 30000)

      // Add to zip
      const filename = `${school.school_code}_${sanitizeFileName(school.school_name)}_report_${lang}.pdf`
      zip.file(filename, blob)

      // IMPORTANT: pause between PDFs to prevent timeout
      await new Promise(r => setTimeout(r, 400))
    } catch (error) {
      console.error('BULK_PDF_FAIL', school.school_code, error)
      failures.push(`${school.school_code} (${school.school_name})`)
    }
  }

  // Generate and download zip
  try {
    console.log('📦 Generating ZIP file...')
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    console.log('💾 Downloading ZIP...')
    const zipFilename = `jodhpur_reports_${lang}.zip`
    
    try {
      saveAs(zipBlob, zipFilename)
      console.log('✅ ZIP download initiated')
    } catch (saveError) {
      console.error('saveAs failed:', saveError)
      throw new Error('Failed to save ZIP file')
    }

    // Show summary
    if (failures.length > 0) {
      alert(
        `Downloaded ${schools.length - failures.length} of ${schools.length} PDFs.\n\nFailed:\n${failures.join('\n')}`
      )
    } else {
      alert(`Successfully downloaded all ${schools.length} school PDFs!`)
    }
  } catch (error) {
    console.error('ZIP generation/save failed:', error)
    alert('Failed to create ZIP file. Check console for details.')
    throw error
  }
}

