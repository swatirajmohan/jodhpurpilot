/**
 * Single PDF Open
 * Opens a PDF for a single school in a new tab
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

export async function downloadSchoolPdf(schoolCode: string, lang: PdfLang = 'en'): Promise<void> {
  console.log('PDF_CLICK', schoolCode, lang)

  const schools = schoolsData as School[]
  const school = schools.find((s) => s.school_code === schoolCode)

  if (!school) {
    throw new Error(`School with code ${schoolCode} not found`)
  }

  const allScoreRows = scoreRowsData as ScoreRow[]
  const schoolScoreRows = allScoreRows.filter((row) => row.school_code === schoolCode)

  const allAggregates = aggregatesData as Aggregates[]
  const schoolAggregates = allAggregates.find((a) => a.school_code === schoolCode) || null

  // Build document definition
  const docDefinition = buildSchoolReportPdf({
    school,
    aggregates: schoolAggregates,
    scoreRows: schoolScoreRows,
    lang,
  })

  console.log('DOC_READY', !!docDefinition, (docDefinition as any)?.content?.length)

  // Sanitise docDefinition to prevent crashes
  const safeDoc = sanitiseDocDefinition(docDefinition)

  console.log('DOC_SANITISED', !!safeDoc)

  // Load pdfMake
  const pdfMake = await loadPdfMake()

  console.log('PDFMAKE_READY', !!pdfMake, typeof pdfMake?.createPdf)

  // Open PDF in new tab (browsers allow this, block downloads)
  pdfMake.createPdf(safeDoc).open()

  console.log('OPEN_CALLED')
}

