/**
 * PDF Download Utility
 * Completely isolated from UI components
 */

import { pdf } from '@react-pdf/renderer'
import { SchoolReportPdf } from './SchoolReportPdf'
import { PdfLanguage } from './pdfTranslations'
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

export async function downloadSchoolPdf(schoolCode: string, language: PdfLanguage = 'en'): Promise<void> {
  const schools = schoolsData as School[]
  const school = schools.find((s) => s.school_code === schoolCode)

  if (!school) {
    throw new Error(`School with code ${schoolCode} not found`)
  }

  const allScoreRows = scoreRowsData as ScoreRow[]
  const schoolScoreRows = allScoreRows.filter((row) => row.school_code === schoolCode)

  const allAggregates = aggregatesData as Aggregates[]
  const schoolAggregates = allAggregates.find((a) => a.school_code === schoolCode) || null

  // Generate blob
  const blob = await pdf(
    <SchoolReportPdf
      lang={language}
      school={school}
      scoreRows={schoolScoreRows}
      aggregates={schoolAggregates}
    />
  ).toBlob()

  // Download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${school.school_code}_${sanitizeFileName(school.school_name)}_report_${language}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

