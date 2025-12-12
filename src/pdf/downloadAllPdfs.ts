/**
 * Bulk PDF Download
 * Downloads all school PDFs sequentially
 */

import { loadPdfMake } from './loadPdfMake'
import { buildSchoolReportPdf } from './buildSchoolReportPdf'
import { sanitiseDocDefinition } from './sanitiseDocDefinition'
import { PdfLang } from './translations'
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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function downloadAllPdfs(
  lang: PdfLang = 'en',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const schools = schoolsData as School[]
  const allScoreRows = scoreRowsData as ScoreRow[]
  const allAggregates = aggregatesData as Aggregates[]

  let success = 0
  const failures: string[] = []

  // Load pdfMake ONCE outside loop
  const pdfMake = await loadPdfMake()

  // Process schools sequentially with direct downloads
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

      // Yield so UI updates
      await new Promise(requestAnimationFrame)

      // Direct download (no zip, no blob, no buffer)
      const filename = `${school.school_code}_${sanitizeFileName(school.school_name)}_report_${lang}.pdf`
      pdfMake.createPdf(safeDoc).download(filename)

      success++

      // IMPORTANT: pause between PDFs (700ms)
      await sleep(700)
    } catch (error) {
      console.error('BULK_PDF_FAIL', school.school_code, error)
      failures.push(`${school.school_code} (${school.school_name})`)
    }
  }

  // Show summary
  if (failures.length > 0) {
    alert(
      `Downloaded ${success} of ${schools.length} PDFs.\n\nFailed:\n${failures.join('\n')}`
    )
  } else {
    alert(`Successfully downloaded all ${schools.length} school PDFs!`)
  }
}

