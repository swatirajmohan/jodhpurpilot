/**
 * Bulk PDF Open
 * Opens all school PDFs in new tabs (staggered)
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

export async function downloadAllPdfs(
  lang: PdfLang = 'en',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const schools = schoolsData as School[]
  const allScoreRows = scoreRowsData as ScoreRow[]
  const allAggregates = aggregatesData as Aggregates[]

  // Load pdfMake ONCE
  const pdfMake = await loadPdfMake()

  // Stagger tab opens to avoid browser blocking
  schools.forEach((school, index) => {
    setTimeout(() => {
      try {
        console.log(`BULK_PDF_${index + 1}`, school.school_code, lang)

        // Report progress
        if (onProgress) {
          onProgress(index + 1, schools.length)
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

        // Open PDF in new tab
        pdfMake.createPdf(safeDoc).open()

        console.log(`BULK_OPEN_${index + 1}`, school.school_code)
      } catch (error) {
        console.error('BULK_PDF_FAIL', school.school_code, error)
      }
    }, index * 400)
  })

  // Show message immediately
  alert(`Opening all ${schools.length} school PDFs in new tabs. Please save them manually.`)
}

