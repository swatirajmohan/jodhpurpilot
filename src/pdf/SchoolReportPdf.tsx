/**
 * School Report PDF Component (ISOLATED)
 * 
 * MANDATORY RULES:
 * - Must ALWAYS return <Document>
 * - Must ALWAYS return <Page>
 * - Must ALWAYS render at least one <Text>
 * - NO early return
 * - NO null
 * - NO conditional skips
 * - If data missing, render "-"
 * - Wrap ALL dynamic text in String()
 */

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDF_FONT_FAMILY } from './pdfFonts'
import { t, PdfLanguage } from './pdfTranslations'

// Import fonts at module load (side effect)
import './pdfFonts'

// DO NOT import from dashboard components
// DO NOT import UI components
// Completely isolated

interface SchoolData {
  school_code: string
  school_name: string
}

interface ScoreRowData {
  school_code: string
  grade_level: number
  subject: string
  competency_name: string
  score_10: number
  priority_band: 'High' | 'Medium' | 'Low'
}

interface AggregatesData {
  school_code: string
  overall_avg: number | null
  subject_avg_map: {
    English: number | null
    Mathematics: number | null
    Science: number | null
    'Social Science': number | null
  }
}

interface SchoolReportPdfProps {
  lang: PdfLanguage
  school: SchoolData
  scoreRows: ScoreRowData[]
  aggregates: AggregatesData | null
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: PDF_FONT_FAMILY,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legend: {
    fontSize: 9,
    marginBottom: 10,
    color: '#666',
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e0e0e0',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottom: '2pt solid #000',
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    textAlign: 'center',
    borderRight: '1pt solid #e0e0e0',
  },
  tableCellLast: {
    padding: 6,
    fontSize: 10,
    textAlign: 'center',
  },
  priorityHigh: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  priorityMedium: {
    backgroundColor: '#fff9c4',
    color: '#f57f17',
  },
  priorityLow: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subjectTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  gradeSection: {
    marginBottom: 15,
  },
})

export function SchoolReportPdf({ lang, school, scoreRows, aggregates }: SchoolReportPdfProps) {
  // TRY-CATCH SAFETY NET
  try {
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
        return { high: 0, medium: 0, low: 0, hasData: false }
      }

      return {
        high: filtered.filter((r) => r.priority_band === 'High').length,
        medium: filtered.filter((r) => r.priority_band === 'Medium').length,
        low: filtered.filter((r) => r.priority_band === 'Low').length,
        hasData: true,
      }
    }

    // Helper: Get competencies for grade and subject
    const getCompetencies = (grade: number, subject: string): ScoreRowData[] => {
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

    return (
      <Document>
        {/* Page 1: Summary */}
        <Page size="A4" style={styles.page}>
          {/* Fail-safe text node */}
          <View style={{ position: 'absolute', opacity: 0 }}>
            <Text> </Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{String(t(lang, 'reportTitle'))}</Text>
            <Text style={styles.subtitle}>{String(school.school_name || '')}</Text>
            <Text style={styles.subtitle}>
              <Text>{String(t(lang, 'schoolCode'))}</Text>
              <Text>: </Text>
              <Text>{String(school.school_code || '')}</Text>
            </Text>
          </View>

          {/* Subject-wise Average Scores */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{String(t(lang, 'subjectwiseAverages'))}</Text>
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: '50%' }]}>
                  {String(t(lang, 'subject'))}
                </Text>
                <Text style={[styles.tableCellLast, { width: '50%' }]}>
                  {String(t(lang, 'averageScore'))}
                </Text>
              </View>
              {/* Overall */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '50%' }]}>
                  {String(t(lang, 'overallAverage'))}
                </Text>
                <Text style={[styles.tableCellLast, { width: '50%' }]}>
                  {String(
                    aggregates?.overall_avg !== null &&
                      aggregates?.overall_avg !== undefined &&
                      typeof aggregates.overall_avg === 'number'
                      ? aggregates.overall_avg.toFixed(1)
                      : '-'
                  )}
                </Text>
              </View>
              {/* Subjects */}
              {subjects.map((subject) => (
                <View key={subject} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '50%' }]}>
                    {String(t(lang, subject.toLowerCase().replace(' ', '') === 'socialscience' ? 'socialScience' : subject.toLowerCase()))}
                  </Text>
                  <Text style={[styles.tableCellLast, { width: '50%' }]}>
                    {String(getSubjectAvg(subject))}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Competency Priority Distribution */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              {String(t(lang, 'priorityDistribution'))}
            </Text>
            <Text style={styles.legend}>
              <Text>H = </Text>
              <Text>{String(t(lang, 'highPriority'))}</Text>
              <Text>  |  M = </Text>
              <Text>{String(t(lang, 'mediumPriority'))}</Text>
              <Text>  |  L = </Text>
              <Text>{String(t(lang, 'lowPriority'))}</Text>
              <Text>  |  - = </Text>
              <Text>{String(t(lang, 'noData'))}</Text>
            </Text>

            {/* Table 1: English + Math */}
            <View style={styles.table} wrap={false}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={{ flex: 1.2 }} />
                <View style={{ flex: 3, alignItems: 'center' }}>
                  <Text style={styles.tableCell}>{String(t(lang, 'english'))}</Text>
                </View>
                <View style={{ flex: 3, alignItems: 'center' }}>
                  <Text style={styles.tableCellLast}>{String(t(lang, 'mathematics'))}</Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{String(t(lang, 'grade'))}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>H</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>M</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>L</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>H</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>M</Text>
                <Text style={[styles.tableCellLast, { flex: 1 }]}>L</Text>
              </View>
              {grades.map((grade) => {
                const english = getPriorityCounts(grade, 'English')
                const math = getPriorityCounts(grade, 'Mathematics')
                return (
                  <View key={grade} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>{String(grade)}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityHigh]}>
                      {String(english.hasData ? english.high : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityMedium]}>
                      {String(english.hasData ? english.medium : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityLow]}>
                      {String(english.hasData ? english.low : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityHigh]}>
                      {String(math.hasData ? math.high : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityMedium]}>
                      {String(math.hasData ? math.medium : '-')}
                    </Text>
                    <Text style={[styles.tableCellLast, { flex: 1 }, styles.priorityLow]}>
                      {String(math.hasData ? math.low : '-')}
                    </Text>
                  </View>
                )
              })}
            </View>

            {/* Table 2: Science + Social Science */}
            <View style={styles.table} wrap={false}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={{ flex: 1.2 }} />
                <View style={{ flex: 3, alignItems: 'center' }}>
                  <Text style={styles.tableCell}>{String(t(lang, 'science'))}</Text>
                </View>
                <View style={{ flex: 3, alignItems: 'center' }}>
                  <Text style={styles.tableCellLast}>{String(t(lang, 'socialScience'))}</Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{String(t(lang, 'grade'))}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>H</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>M</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>L</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>H</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>M</Text>
                <Text style={[styles.tableCellLast, { flex: 1 }]}>L</Text>
              </View>
              {grades.map((grade) => {
                const science = getPriorityCounts(grade, 'Science')
                const socialScience = getPriorityCounts(grade, 'Social Science')
                return (
                  <View key={grade} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>{String(grade)}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityHigh]}>
                      {String(science.hasData ? science.high : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityMedium]}>
                      {String(science.hasData ? science.medium : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityLow]}>
                      {String(science.hasData ? science.low : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityHigh]}>
                      {String(socialScience.hasData ? socialScience.high : '-')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }, styles.priorityMedium]}>
                      {String(socialScience.hasData ? socialScience.medium : '-')}
                    </Text>
                    <Text style={[styles.tableCellLast, { flex: 1 }, styles.priorityLow]}>
                      {String(socialScience.hasData ? socialScience.low : '-')}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        </Page>

        {/* Pages 2-4: Grade-wise detailed competency tables */}
        {grades.map((grade) => {
          const gradeLabel = String(t(lang, `grade${grade}` as any))
          const detailedLabel = String(t(lang, 'detailedReport'))

          return (
            <Page key={grade} size="A4" style={styles.page} break>
              <Text style={styles.gradeTitle}>
                <Text>{gradeLabel}</Text>
                <Text> - </Text>
                <Text>{detailedLabel}</Text>
              </Text>

              {subjects.map((subject) => {
                const competencies = getCompetencies(grade, subject)
                const subjectKey =
                  subject.toLowerCase().replace(' ', '') === 'socialscience'
                    ? 'socialScience'
                    : subject.toLowerCase()

                // Always render the section, even if no data
                return (
                  <View key={subject} style={styles.gradeSection}>
                    <Text style={styles.subjectTitle}>{String(t(lang, subjectKey))}</Text>
                    <View style={styles.table}>
                      {/* Header */}
                      <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: '60%' }]}>
                          {String(t(lang, 'competency'))}
                        </Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>
                          {String(t(lang, 'score'))}
                        </Text>
                        <Text style={[styles.tableCellLast, { width: '20%' }]}>
                          {String(t(lang, 'priority'))}
                        </Text>
                      </View>
                      {/* Data rows or no data message */}
                      {competencies.length === 0 ? (
                        <View style={styles.tableRow}>
                          <Text style={[styles.tableCell, { width: '100%' }]}>
                            {String(t(lang, 'noData'))}
                          </Text>
                        </View>
                      ) : (
                        competencies.map((comp, index) => {
                          const priorityStyle =
                            comp.priority_band === 'High'
                              ? styles.priorityHigh
                              : comp.priority_band === 'Medium'
                              ? styles.priorityMedium
                              : styles.priorityLow

                          const priorityLabel =
                            comp.priority_band === 'High'
                              ? 'high'
                              : comp.priority_band === 'Medium'
                              ? 'medium'
                              : 'low'

                          return (
                            <View key={index} style={styles.tableRow}>
                              <Text style={[styles.tableCell, { width: '60%', fontSize: 9 }]}>
                                {String(t(lang, comp.competency_name))}
                              </Text>
                              <Text style={[styles.tableCell, { width: '20%' }, priorityStyle]}>
                                {String(comp.score_10.toFixed(1))}
                              </Text>
                              <Text
                                style={[styles.tableCellLast, { width: '20%' }, priorityStyle]}
                              >
                                {String(t(lang, priorityLabel))}
                              </Text>
                            </View>
                          )
                        })
                      )}
                    </View>
                  </View>
                )
              })}
            </Page>
          )
        })}
      </Document>
    )
  } catch (error) {
    // SAFETY NET: If anything fails, return minimal fallback PDF
    console.error('PDF generation error:', error)
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>PDF generation error</Text>
          <Text style={styles.subtitle}>Unable to generate report</Text>
        </Page>
      </Document>
    )
  }
}

