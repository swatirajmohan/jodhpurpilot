/**
 * pdfmake School Report Builder
 * Builds documentDefinition for a single school
 */

import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { t, PdfLang } from './translations'
import { fonts } from './fonts'

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

interface BuildPdfOptions {
  school: School
  aggregates: Aggregates | null
  scoreRows: ScoreRow[]
  lang: PdfLang
}

// Priority colors
const PRIORITY_COLORS = {
  high: '#ffebee',
  medium: '#fff9c4',
  low: '#e8f5e9',
}

export function buildSchoolReportPdf({
  school,
  aggregates,
  scoreRows,
  lang,
}: BuildPdfOptions): TDocumentDefinitions {
  const grades = [6, 7, 8]
  const subjects = ['English', 'Mathematics', 'Science', 'Social Science']

  // Helper: Get subject average
  const getSubjectAvg = (subject: string): string => {
    if (!aggregates) return '-'
    const value = aggregates.subject_avg_map[subject as keyof typeof aggregates.subject_avg_map]
    return value !== null && value !== undefined && typeof value === 'number'
      ? value.toFixed(1)
      : '-'
  }

  // Helper: Get priority counts
  const getPriorityCounts = (grade: number, subject: string) => {
    const filtered = scoreRows.filter(
      (row) => row.grade_level === grade && row.subject === subject
    )

    if (filtered.length === 0) {
      return { high: '-', medium: '-', low: '-' }
    }

    return {
      high: String(filtered.filter((r) => r.priority_band === 'High').length),
      medium: String(filtered.filter((r) => r.priority_band === 'Medium').length),
      low: String(filtered.filter((r) => r.priority_band === 'Low').length),
    }
  }

  // Helper: Get competencies for grade and subject
  const getCompetencies = (grade: number, subject: string): ScoreRow[] => {
    const filtered = scoreRows.filter(
      (row) => row.grade_level === grade && row.subject === subject
    )

    // Sort by priority band then score
    const priorityOrder = { High: 1, Medium: 2, Low: 3 }
    return filtered.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority_band] - priorityOrder[b.priority_band]
      if (priorityDiff !== 0) return priorityDiff
      return a.score_10 - b.score_10
    })
  }

  // Helper: Get priority fillColor
  const getPriorityColor = (band: 'High' | 'Medium' | 'Low'): string => {
    if (band === 'High') return PRIORITY_COLORS.high
    if (band === 'Medium') return PRIORITY_COLORS.medium
    return PRIORITY_COLORS.low
  }

  // Build document content
  const content: any[] = []

  // 1. Header
  content.push({
    text: t(lang, 'reportTitle'),
    style: 'header',
    alignment: 'center',
    margin: [0, 0, 0, 10],
  })

  content.push({
    text: school.school_name,
    style: 'subheader',
    alignment: 'center',
    margin: [0, 0, 0, 5],
  })

  content.push({
    text: `${t(lang, 'schoolCode')}: ${school.school_code}`,
    alignment: 'center',
    margin: [0, 0, 0, 20],
  })

  // 2. Subject-wise Average Scores
  content.push({
    text: t(lang, 'subjectwiseAverages'),
    style: 'sectionHeader',
    margin: [0, 10, 0, 10],
  })

  const avgTableBody: any[][] = [
    [
      { text: t(lang, 'subject'), style: 'tableHeader', bold: true },
      { text: t(lang, 'averageScore'), style: 'tableHeader', bold: true },
    ],
    [
      t(lang, 'overallAverage'),
      aggregates?.overall_avg !== null && aggregates?.overall_avg !== undefined
        ? aggregates.overall_avg.toFixed(1)
        : '-',
    ],
  ]

  subjects.forEach((subject) => {
    const subjectKey =
      subject === 'Social Science'
        ? 'socialScience'
        : subject.toLowerCase()
    avgTableBody.push([t(lang, subjectKey), getSubjectAvg(subject)])
  })

  content.push({
    table: {
      widths: ['*', '*'],
      body: avgTableBody,
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f5f5f5' : null),
    },
    margin: [0, 0, 0, 20],
  })

  // 3. Competency Priority Distribution
  content.push({
    text: t(lang, 'priorityDistribution'),
    style: 'sectionHeader',
    margin: [0, 10, 0, 5],
  })

  content.push({
    text: `H = ${t(lang, 'highPriority')}  |  M = ${t(lang, 'mediumPriority')}  |  L = ${t(lang, 'lowPriority')}  |  - = ${t(lang, 'noData')}`,
    fontSize: 9,
    color: '#666',
    margin: [0, 0, 0, 10],
  })

  // Table 1: English + Math
  const table1Body: any[][] = [
    [
      { text: '', rowSpan: 2 },
      { text: t(lang, 'english'), colSpan: 3, alignment: 'center', bold: true },
      {},
      {},
      { text: t(lang, 'mathematics'), colSpan: 3, alignment: 'center', bold: true },
      {},
      {},
    ],
    [
      {},
      { text: 'H', alignment: 'center', bold: true },
      { text: 'M', alignment: 'center', bold: true },
      { text: 'L', alignment: 'center', bold: true },
      { text: 'H', alignment: 'center', bold: true },
      { text: 'M', alignment: 'center', bold: true },
      { text: 'L', alignment: 'center', bold: true },
    ],
  ]

  grades.forEach((grade) => {
    const english = getPriorityCounts(grade, 'English')
    const math = getPriorityCounts(grade, 'Mathematics')
    table1Body.push([
      { text: String(grade), alignment: 'center' },
      { text: english.high, alignment: 'center', fillColor: PRIORITY_COLORS.high },
      { text: english.medium, alignment: 'center', fillColor: PRIORITY_COLORS.medium },
      { text: english.low, alignment: 'center', fillColor: PRIORITY_COLORS.low },
      { text: math.high, alignment: 'center', fillColor: PRIORITY_COLORS.high },
      { text: math.medium, alignment: 'center', fillColor: PRIORITY_COLORS.medium },
      { text: math.low, alignment: 'center', fillColor: PRIORITY_COLORS.low },
    ])
  })

  content.push({
    table: {
      widths: [40, 50, 50, 50, 50, 50, 50],
      body: table1Body,
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex < 2 ? '#f5f5f5' : null),
    },
    margin: [0, 0, 0, 10],
  })

  // Table 2: Science + Social Science
  const table2Body: any[][] = [
    [
      { text: '', rowSpan: 2 },
      { text: t(lang, 'science'), colSpan: 3, alignment: 'center', bold: true },
      {},
      {},
      { text: t(lang, 'socialScience'), colSpan: 3, alignment: 'center', bold: true },
      {},
      {},
    ],
    [
      {},
      { text: 'H', alignment: 'center', bold: true },
      { text: 'M', alignment: 'center', bold: true },
      { text: 'L', alignment: 'center', bold: true },
      { text: 'H', alignment: 'center', bold: true },
      { text: 'M', alignment: 'center', bold: true },
      { text: 'L', alignment: 'center', bold: true },
    ],
  ]

  grades.forEach((grade) => {
    const science = getPriorityCounts(grade, 'Science')
    const socialScience = getPriorityCounts(grade, 'Social Science')
    table2Body.push([
      { text: String(grade), alignment: 'center' },
      { text: science.high, alignment: 'center', fillColor: PRIORITY_COLORS.high },
      { text: science.medium, alignment: 'center', fillColor: PRIORITY_COLORS.medium },
      { text: science.low, alignment: 'center', fillColor: PRIORITY_COLORS.low },
      { text: socialScience.high, alignment: 'center', fillColor: PRIORITY_COLORS.high },
      { text: socialScience.medium, alignment: 'center', fillColor: PRIORITY_COLORS.medium },
      { text: socialScience.low, alignment: 'center', fillColor: PRIORITY_COLORS.low },
    ])
  })

  content.push({
    table: {
      widths: [40, 50, 50, 50, 50, 50, 50],
      body: table2Body,
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex < 2 ? '#f5f5f5' : null),
    },
    margin: [0, 0, 0, 20],
  })

  // 4. Grade-wise detailed competency tables
  grades.forEach((grade, gradeIndex) => {
    if (gradeIndex > 0) {
      content.push({ text: '', pageBreak: 'before' })
    }

    content.push({
      text: `${t(lang, `grade${grade}` as any)} - ${t(lang, 'detailedReport')}`,
      style: 'gradeHeader',
      alignment: 'center',
      margin: [0, 0, 0, 20],
    })

    subjects.forEach((subject) => {
      const competencies = getCompetencies(grade, subject)
      const subjectKey =
        subject === 'Social Science' ? 'socialScience' : subject.toLowerCase()

      content.push({
        text: t(lang, subjectKey),
        style: 'subjectHeader',
        margin: [0, 10, 0, 5],
      })

      if (competencies.length === 0) {
        content.push({
          text: t(lang, 'noData'),
          italics: true,
          color: '#999',
          margin: [0, 0, 0, 10],
        })
      } else {
        const compTableBody: any[][] = [
          [
            { text: t(lang, 'competency'), style: 'tableHeader', bold: true },
            { text: t(lang, 'score'), style: 'tableHeader', bold: true },
            { text: t(lang, 'priority'), style: 'tableHeader', bold: true },
          ],
        ]

        competencies.forEach((comp) => {
          const priorityLabel =
            comp.priority_band === 'High'
              ? 'high'
              : comp.priority_band === 'Medium'
              ? 'medium'
              : 'low'

          compTableBody.push([
            { text: t(lang, comp.competency_name), fontSize: 9 },
            {
              text: comp.score_10.toFixed(1),
              alignment: 'center',
              fillColor: getPriorityColor(comp.priority_band),
            },
            {
              text: t(lang, priorityLabel),
              alignment: 'center',
              fillColor: getPriorityColor(comp.priority_band),
            },
          ])
        })

        content.push({
          table: {
            widths: ['*', 60, 60],
            body: compTableBody,
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f5f5f5' : null),
          },
          margin: [0, 0, 0, 10],
        })
      }
    })
  })

  // Return document definition
  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: fonts[lang],
      fontSize: 10,
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 14,
        bold: true,
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
      },
      gradeHeader: {
        fontSize: 16,
        bold: true,
      },
      subjectHeader: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        fillColor: '#f5f5f5',
        alignment: 'center',
      },
    },
    content,
  }
}

