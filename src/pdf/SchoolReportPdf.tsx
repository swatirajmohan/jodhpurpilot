import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { School, ScoreRow, Aggregates } from '../types'

interface SchoolReportPdfProps {
  school: School
  scoreRows: ScoreRow[]
  aggregates: Aggregates | null
}

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    marginBottom: 20,
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
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // Table
  table: {
    width: '100%',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
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
  // Column widths for priority tables
  colGrade: {
    width: '12%',
  },
  colSubject: {
    width: '22%',
  },
  colHML: {
    width: '11%',
  },
  // Page break
  pageBreak: {
    marginTop: 20,
  },
  legend: {
    fontSize: 9,
    marginBottom: 10,
    color: '#666',
  },
})

export function SchoolReportPdf({ school, scoreRows, aggregates }: SchoolReportPdfProps) {
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>School Assessment Report Card</Text>
          <Text style={styles.subtitle}>{school.school_name}</Text>
          <Text style={styles.subtitle}>School Code: {school.school_code}</Text>
        </View>

        {/* Subject-wise Average Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject-wise Average Scores</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '50%' }]}>Subject</Text>
              <Text style={[styles.tableCellLast, { width: '50%' }]}>Average Score</Text>
            </View>
            {/* Overall */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>Overall School Average</Text>
              <Text style={[styles.tableCellLast, { width: '50%' }]}>
                {aggregates?.overall_avg !== null && aggregates?.overall_avg !== undefined && typeof aggregates.overall_avg === 'number'
                  ? aggregates.overall_avg.toFixed(1) 
                  : '-'}
              </Text>
            </View>
            {/* Subjects */}
            {subjects.map(subject => (
              <View key={subject} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '50%' }]}>{subject}</Text>
                <Text style={[styles.tableCellLast, { width: '50%' }]}>{getSubjectAverage(subject)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Competency Priority Distribution by Grade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Competency Priority Distribution by Grade</Text>
          <Text style={styles.legend}>
            H = High Priority (0-4.9)  |  M = Medium Priority (5.0-6.9)  |  L = Low Priority (7.0+)  |  - = No data
          </Text>

          {/* Table 1: English and Mathematics */}
          <View style={styles.table}>
            {/* Header Row 1 */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.colGrade]}>Grade</Text>
              <Text style={[styles.tableCell, { width: '44%' }]}>English</Text>
              <Text style={[styles.tableCellLast, { width: '44%' }]}>Mathematics</Text>
            </View>
            {/* Header Row 2 */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.colGrade]}></Text>
              <Text style={[styles.tableCell, styles.colHML]}>H</Text>
              <Text style={[styles.tableCell, styles.colHML]}>M</Text>
              <Text style={[styles.tableCell, styles.colHML]}>L</Text>
              <Text style={[styles.tableCell, styles.colHML]}>H</Text>
              <Text style={[styles.tableCell, styles.colHML]}>M</Text>
              <Text style={[styles.tableCellLast, styles.colHML]}>L</Text>
            </View>
            {/* Data Rows */}
            {grades.map(grade => {
              const english = getPriorityCounts(grade, 'English')
              const math = getPriorityCounts(grade, 'Mathematics')
              return (
                <View key={grade} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colGrade]}>{grade}</Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityHigh]}>
                    {english.hasData ? english.high : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityMedium]}>
                    {english.hasData ? english.medium : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityLow]}>
                    {english.hasData ? english.low : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityHigh]}>
                    {math.hasData ? math.high : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityMedium]}>
                    {math.hasData ? math.medium : '-'}
                  </Text>
                  <Text style={[styles.tableCellLast, styles.colHML, styles.priorityLow]}>
                    {math.hasData ? math.low : '-'}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Table 2: Science and Social Science */}
          <View style={styles.table}>
            {/* Header Row 1 */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.colGrade]}>Grade</Text>
              <Text style={[styles.tableCell, { width: '44%' }]}>Science</Text>
              <Text style={[styles.tableCellLast, { width: '44%' }]}>Social Science</Text>
            </View>
            {/* Header Row 2 */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.colGrade]}></Text>
              <Text style={[styles.tableCell, styles.colHML]}>H</Text>
              <Text style={[styles.tableCell, styles.colHML]}>M</Text>
              <Text style={[styles.tableCell, styles.colHML]}>L</Text>
              <Text style={[styles.tableCell, styles.colHML]}>H</Text>
              <Text style={[styles.tableCell, styles.colHML]}>M</Text>
              <Text style={[styles.tableCellLast, styles.colHML]}>L</Text>
            </View>
            {/* Data Rows */}
            {grades.map(grade => {
              const science = getPriorityCounts(grade, 'Science')
              const socialScience = getPriorityCounts(grade, 'Social Science')
              return (
                <View key={grade} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colGrade]}>{grade}</Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityHigh]}>
                    {science.hasData ? science.high : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityMedium]}>
                    {science.hasData ? science.medium : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityLow]}>
                    {science.hasData ? science.low : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityHigh]}>
                    {socialScience.hasData ? socialScience.high : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHML, styles.priorityMedium]}>
                    {socialScience.hasData ? socialScience.medium : '-'}
                  </Text>
                  <Text style={[styles.tableCellLast, styles.colHML, styles.priorityLow]}>
                    {socialScience.hasData ? socialScience.low : '-'}
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
        
        if (!gradeHasData) return null

        return (
          <Page key={grade} size="A4" style={styles.page}>
            <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>Grade {grade} - Detailed Competency Report</Text>

            {subjects.map(subject => {
              const competencies = getCompetencies(grade, subject)
              
              if (competencies.length === 0) return null

              return (
                <View key={subject} style={styles.section}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>{subject}</Text>
                  <View style={styles.table}>
                    {/* Header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, { width: '60%' }]}>Competency</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>Score</Text>
                      <Text style={[styles.tableCellLast, { width: '20%' }]}>Priority</Text>
                    </View>
                    {/* Data Rows */}
                    {competencies.map((comp, index) => {
                      const priorityStyle = 
                        comp.priority_band === 'High' ? styles.priorityHigh :
                        comp.priority_band === 'Medium' ? styles.priorityMedium :
                        styles.priorityLow
                      
                      return (
                        <View key={index} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { width: '60%', fontSize: 9 }]}>
                            {comp.competency_name}
                          </Text>
                          <Text style={[styles.tableCell, { width: '20%' }, priorityStyle]}>
                            {comp.score_10.toFixed(1)}
                          </Text>
                          <Text style={[styles.tableCellLast, { width: '20%' }, priorityStyle]}>
                            {comp.priority_band}
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

