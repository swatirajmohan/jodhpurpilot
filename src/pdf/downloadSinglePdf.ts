/**
 * Single PDF Download
 * Downloads a PDF for a single school
 */

import { getPdfMake } from './fonts'
import { buildSchoolReportPdf } from './buildSchoolReportPdf'
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

export function downloadSchoolPdf(schoolCode: string, lang: PdfLang = 'en'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const schools = schoolsData as School[]
      const school = schools.find((s) => s.school_code === schoolCode)

      if (!school) {
        reject(new Error(`School with code ${schoolCode} not found`))
        return
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

      // Generate and download PDF
      const filename = `${school.school_code}_${sanitizeFileName(school.school_name)}_report_${lang}.pdf`

      const pdfMake = getPdfMake()
      pdfMake.createPdf(docDefinition).download(filename, () => {
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

