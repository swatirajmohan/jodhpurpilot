import { pdf } from '@react-pdf/renderer'
import { SchoolReportPdf } from './SchoolReportPdf'
import { School, ScoreRow, Aggregates } from '../types'
import { Language } from '../i18n/labels'
import schoolsData from '../data/schools.json'
import scoreRowsData from '../data/score_rows.json'
import aggregatesData from '../data/aggregates.json'

/**
 * Sanitize school name for safe file naming
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}

/**
 * Download PDF for a specific school
 * @param schoolCode - The school code to generate PDF for
 * @param language - The language for the PDF ('en' or 'hi')
 */
export async function downloadSchoolPdf(schoolCode: string, language: Language = 'en'): Promise<void> {
  // Find school
  const schools = schoolsData as School[]
  const school = schools.find(s => s.school_code === schoolCode)
  
  if (!school) {
    throw new Error(`School with code ${schoolCode} not found`)
  }

  // Get score rows for this school
  const allScoreRows = scoreRowsData as ScoreRow[]
  const scoreRows = allScoreRows.filter(row => row.school_code === schoolCode)

  // Get aggregates for this school
  const allAggregates = aggregatesData as Aggregates[]
  const aggregates = allAggregates.find(a => a.school_code === schoolCode) || null

  // Generate PDF blob
  const blob = await pdf(
    SchoolReportPdf({ school, scoreRows, aggregates, language })
  ).toBlob()

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  // Set filename with language suffix
  const sanitizedName = sanitizeFileName(school.school_name)
  link.download = `${school.school_code}_${sanitizedName}_report_${language}.pdf`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

