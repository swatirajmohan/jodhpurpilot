/**
 * Bulk PDF Download
 * Downloads all school PDFs as a ZIP file
 */

import { getPdfMake } from './fonts'
import { buildSchoolReportPdf } from './buildSchoolReportPdf'
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

  // Initialize pdfMake once for all schools
  const pdfMake = getPdfMake()

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

      // Generate PDF blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        pdfMake.createPdf(docDefinition).getBlob((result: Blob) => {
          if (result) {
            resolve(result)
          } else {
            reject(new Error('Failed to generate PDF blob'))
          }
        })
      })

      // Add to zip
      const filename = `${school.school_code}_${sanitizeFileName(school.school_name)}_report_${lang}.pdf`
      zip.file(filename, blob)
    } catch (error) {
      console.error(`Failed to generate PDF for ${school.school_code}:`, error)
      failures.push(`${school.school_code} (${school.school_name})`)
    }
  }

  // Generate and download zip
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipFilename = `jodhpur_reports_${lang}_${new Date().toISOString().split('T')[0]}.zip`
    saveAs(zipBlob, zipFilename)

    // Show summary
    if (failures.length > 0) {
      alert(
        `Downloaded ${schools.length - failures.length} of ${schools.length} PDFs.\n\nFailed:\n${failures.join('\n')}`
      )
    } else {
      alert(`Successfully downloaded all ${schools.length} school PDFs!`)
    }
  } catch (error) {
    console.error('Failed to create ZIP file:', error)
    alert('Failed to create ZIP file. Check console for details.')
    throw error
  }
}

