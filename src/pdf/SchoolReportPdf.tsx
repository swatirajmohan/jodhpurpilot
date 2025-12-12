import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { School, ScoreRow, Aggregates } from '../types'
import { Language, labels } from '../i18n/labels'
import { competencyLabels } from '../i18n/competencies'

// Safe translation helper - never crashes
function t(lang: Language, key: string): string {
  try {
    return labels[lang]?.[key as keyof typeof labels.en] || labels.en[key as keyof typeof labels.en] || ''
  } catch {
    return ''
  }
}

// Safe competency translation helper
function tc(lang: Language, competencyName: string): string {
  try {
    return competencyLabels[lang]?.[competencyName] || competencyLabels.en[competencyName] || competencyName || ''
  } catch {
    return competencyName || ''
  }
}

// Register font for Hindi support
Font.register({
  family: 'Noto Sans',
  src: 'https://fonts.gstatic.com/s/notosans/v30/o-0IIpQlx3QUlC5A4PNjXhFVZNyB.woff2',
})

Font.register({
  family: 'Noto Sans Devanagari',
  src: 'https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGUUVpzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlXQly-AzoFoW4Ow.woff2',
})

interface SchoolReportPdfProps {
  school: School
  scoreRows: ScoreRow[]
  aggregates: Aggregates | null
  language: Language
}

// Column width constants for priority distribution tables
const COL_GRADE = 1.2
const COL_HML = 1

// Spacing scale for consistency
const SPACING = {
  sectionGap: 20,
  headingGap: 10,
  rowGap: 15,
}

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Noto Sans',
  },
  // Header
  header: {
    marginBottom: SPACING.sectionGap,
    borderBottom: '2pt solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  // Section
  section: {
    marginBottom: SPACING.rowGap,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.headingGap,
  },
  // Table
  table: {
    width: '100%',
    marginBottom: SPACING.rowGap,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
    minPresenceAhead: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4a5568',
    color: '#fff',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    borderRight: '1pt solid #ddd',
  },
  tableCellLast: {
    padding: 6,
    fontSize: 10,
  },
  // Priority colors
  priorityHigh: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
  },
  priorityMedium: {
    backgroundColor: '#fef5e7',
    color: '#d69e2e',
  },
  priorityLow: {
    backgroundColor: '#c6f6d5',
    color: '#2f855a',
  },
  legend: {
    fontSize: 9,
    marginBottom: SPACING.headingGap,
    color: '#666',
  },
  // Grade section (for page breaks)
  gradeSection: {
    marginBottom: SPACING.sectionGap,
  },
  gradeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.sectionGap,
  },
  subjectTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
})

export function SchoolReportPdf({ school, scoreRows, aggregates, language }: SchoolReportPdfProps) {
  const grades = [6, 7, 8]
  const subjects = ['English', 'Mathematics', 'Science', 'Social Science']

  // Sort competencies by priority band and score
  const sortCompetencies = (competencies: ScoreRow[]): ScoreRow[] => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 }
    return [...competencies].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority_band] - priorityOrder[b.priority_band]
      if (priorityDiff !== 0) return priorityDiff
      return a.score_10 - b.score_10
    })
  }

  // Get competencies for a specific grade and subject
  const getCompetencies = (grade: number, subject: string): ScoreRow[] => {
    const filtered = scoreRows.filter(
      row => row.grade_level === grade && row.subject === subject
    )
    return sortCompetencies(filtered)
  }

  // Get priority counts for a specific grade and subject
  const getPriorityCounts = (grade: number, subject: string) => {
    const filtered = scoreRows.filter(
      row => row.grade_level === grade && row.subject === subject
    )
    
    if (filtered.length === 0) {
      return { high: 0, medium: 0, low: 0, hasData: false }
    }

    return {
      high: filtered.filter(r => r.priority_band === 'High').length,
      medium: filtered.filter(r => r.priority_band === 'Medium').length,
      low: filtered.filter(r => r.priority_band === 'Low').length,
      hasData: true
    }
  }

  // Get average for a subject
  const getSubjectAverage = (subject: string): string => {
    if (!aggregates) return '-'
    const value = aggregates.subject_avg_map[subject as keyof typeof aggregates.subject_avg_map]
    return value !== null && value !== undefined ? value.toFixed(1) : '-'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fail-safe: ensure at least one Text node */}
        <View style={{ position: 'absolute', opacity: 0 }}>
          <Text> </Text>
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{String(t(language, 'reportTitle'))}</Text>
          <Text style={styles.subtitle}>{String(school.school_name || '')}</Text>
          <Text style={styles.subtitle}>
            <Text>{String(t(language, 'schoolCode'))}</Text>
            <Text>: </Text>
            <Text>{String(school.school_code || '')}</Text>
          </Text>
        </View>

        {/* Subject-wise Average Scores */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>{String(t(language, 'subjectwiseAverages'))}</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '50%' }]}>{String(t(language, 'subject'))}</Text>
              <Text style={[styles.tableCellLast, { width: '50%' }]}>{String(t(language, 'averageScore'))}</Text>
            </View>
            {/* Overall */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>{String(t(language, 'overallAverage'))}</Text>
              <Text style={[styles.tableCellLast, { width: '50%' }]}>
                {String(aggregates?.overall_avg !== null && aggregates?.overall_avg !== undefined && typeof aggregates.overall_avg === 'number'
                  ? aggregates.overall_avg.toFixed(1) 
                  : '-')}
              </Text>
            </View>
            {/* Subjects */}
            {subjects.map(subject => {
              const subjectKey = subject.toLowerCase().replace(' ', '') as 'english' | 'mathematics' | 'science' | 'socialscience'
              const subjectLabel = subjectKey === 'socialscience' ? 'socialScience' : subjectKey
              return (
                <View key={subject} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '50%' }]}>{String(t(language, subjectLabel as any))}</Text>
                  <Text style={[styles.tableCellLast, { width: '50%' }]}>{String(getSubjectAverage(subject))}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Competency Priority Distribution by Grade */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>{String(t(language, 'priorityDistribution'))}</Text>
          <Text style={styles.legend}>
            <Text>H = </Text>
            <Text>{String(t(language, 'highPriority'))}</Text>
            <Text>  |  M = </Text>
            <Text>{String(t(language, 'mediumPriority'))}</Text>
            <Text>  |  L = </Text>
            <Text>{String(t(language, 'lowPriority'))}</Text>
            <Text>  |  - = </Text>
            <Text>{String(t(language, 'noData'))}</Text>
          </Text>

          {/* Table 1: English and Mathematics */}
          <View style={styles.table} wrap={false}>
            {/* Header Row 1: Subject names */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={{ flex: COL_GRADE }} />
              <View style={{ flex: COL_HML * 3, alignItems: 'center' }}>
                <Text style={styles.tableCell}>{String(t(language, 'english'))}</Text>
              </View>
              <View style={{ flex: COL_HML * 3, alignItems: 'center' }}>
                <Text style={styles.tableCellLast}>{String(t(language, 'mathematics'))}</Text>
              </View>
            </View>
            {/* Header Row 2: H/M/L labels */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: COL_GRADE }]}>{String(t(language, 'grade'))}</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>H</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>M</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>L</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>H</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>M</Text>
              <Text style={[styles.tableCellLast, { flex: COL_HML }]}>L</Text>
            </View>
            {/* Data Rows */}
            {grades.map(grade => {
              const english = getPriorityCounts(grade, 'English')
              const math = getPriorityCounts(grade, 'Mathematics')
              return (
                <View key={grade} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: COL_GRADE }]}>{String(grade)}</Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityHigh]}>
                    {String(english.hasData ? english.high : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityMedium]}>
                    {String(english.hasData ? english.medium : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityLow]}>
                    {String(english.hasData ? english.low : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityHigh]}>
                    {String(math.hasData ? math.high : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityMedium]}>
                    {String(math.hasData ? math.medium : '-')}
                  </Text>
                  <Text style={[styles.tableCellLast, { flex: COL_HML }, styles.priorityLow]}>
                    {String(math.hasData ? math.low : '-')}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Table 2: Science and Social Science */}
          <View style={styles.table} wrap={false}>
            {/* Header Row 1: Subject names */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={{ flex: COL_GRADE }} />
              <View style={{ flex: COL_HML * 3, alignItems: 'center' }}>
                <Text style={styles.tableCell}>{String(t(language, 'science'))}</Text>
              </View>
              <View style={{ flex: COL_HML * 3, alignItems: 'center' }}>
                <Text style={styles.tableCellLast}>{String(t(language, 'socialScience'))}</Text>
              </View>
            </View>
            {/* Header Row 2: H/M/L labels */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: COL_GRADE }]}>{String(t(language, 'grade'))}</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>H</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>M</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>L</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>H</Text>
              <Text style={[styles.tableCell, { flex: COL_HML }]}>M</Text>
              <Text style={[styles.tableCellLast, { flex: COL_HML }]}>L</Text>
            </View>
            {/* Data Rows */}
            {grades.map(grade => {
              const science = getPriorityCounts(grade, 'Science')
              const socialScience = getPriorityCounts(grade, 'Social Science')
              return (
                <View key={grade} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: COL_GRADE }]}>{String(grade)}</Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityHigh]}>
                    {String(science.hasData ? science.high : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityMedium]}>
                    {String(science.hasData ? science.medium : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityLow]}>
                    {String(science.hasData ? science.low : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityHigh]}>
                    {String(socialScience.hasData ? socialScience.high : '-')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: COL_HML }, styles.priorityMedium]}>
                    {String(socialScience.hasData ? socialScience.medium : '-')}
                  </Text>
                  <Text style={[styles.tableCellLast, { flex: COL_HML }, styles.priorityLow]}>
                    {String(socialScience.hasData ? socialScience.low : '-')}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </Page>

      {/* Grade-wise Detailed Competency Tables (one page per grade) */}
      {grades.map(grade => {
        const gradeHasData = scoreRows.some(row => row.grade_level === grade)
        
        if (!gradeHasData) {
          return (
            <Page key={grade} size="A4" style={styles.page} break>
              <Text style={styles.gradeTitle}>{String(t(language, `grade${grade}` as any))}</Text>
              <Text style={styles.legend}>{String(t(language, 'noData'))}</Text>
            </Page>
          )
        }

        const gradeLabel = `grade${grade}` as 'grade6' | 'grade7' | 'grade8'
        
        return (
          <Page key={grade} size="A4" style={styles.page} break>
            <Text style={styles.gradeTitle}>
              <Text>{String(t(language, gradeLabel))}</Text>
              <Text> - </Text>
              <Text>{String(t(language, 'detailedReport'))}</Text>
            </Text>

            {subjects.map(subject => {
              const competencies = getCompetencies(grade, subject)
              
              if (competencies.length === 0) {
                return (
                  <View key={subject} style={styles.gradeSection}>
                    <Text style={styles.subjectTitle}>{String(t(language, subject.toLowerCase().replace(' ', '') === 'socialscience' ? 'socialScience' : subject.toLowerCase().replace(' ', '') as any))}</Text>
                    <Text style={styles.legend}>{String(t(language, 'noData'))}</Text>
                  </View>
                )
              }

              const subjectKey = subject.toLowerCase().replace(' ', '') as 'english' | 'mathematics' | 'science' | 'socialscience'
              const subjectLabel = subjectKey === 'socialscience' ? 'socialScience' : subjectKey

              return (
                <View key={subject} style={styles.gradeSection}>
                  <Text style={styles.subjectTitle}>{String(t(language, subjectLabel as any))}</Text>
                  <View style={styles.table}>
                    {/* Header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, { width: '60%' }]}>{String(t(language, 'competency'))}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{String(t(language, 'score'))}</Text>
                      <Text style={[styles.tableCellLast, { width: '20%' }]}>{String(t(language, 'priority'))}</Text>
                    </View>
                    {/* Data Rows */}
                    {competencies.map((comp, index) => {
                      const priorityStyle = 
                        comp.priority_band === 'High' ? styles.priorityHigh :
                        comp.priority_band === 'Medium' ? styles.priorityMedium :
                        styles.priorityLow
                      
                      const priorityLabel = comp.priority_band === 'High' ? 'high' : 
                                           comp.priority_band === 'Medium' ? 'medium' : 'low'
                      
                      return (
                        <View key={index} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { width: '60%', fontSize: 9 }]}>
                            {String(tc(language, comp.competency_name))}
                          </Text>
                          <Text style={[styles.tableCell, { width: '20%' }, priorityStyle]}>
                            {String(comp.score_10.toFixed(1))}
                          </Text>
                          <Text style={[styles.tableCellLast, { width: '20%' }, priorityStyle]}>
                            {String(t(language, priorityLabel as any))}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
              )
            })}
          </Page>
        )
      })}
    </Document>
  )
}

