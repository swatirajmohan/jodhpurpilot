import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { School, ScoreRow, Aggregates } from '../types'
import ScoreChip from '../components/ScoreChip'
import schoolsData from '../data/schools.json'
import scoreRowsData from '../data/score_rows.json'
import aggregatesData from '../data/aggregates.json'
import { downloadSchoolPdf } from '../pdf/downloadPdf'
import { useLanguage } from '../contexts/LanguageContext'
import { getLabel } from '../i18n/labels'
import { LanguageToggle } from '../components/LanguageToggle'

function SchoolReport() {
  const { school_code } = useParams<{ school_code: string }>()
  const navigate = useNavigate()
  const { language } = useLanguage()

  // State
  const [school, setSchool] = useState<School | null>(null)
  const [scoreRows, setScoreRows] = useState<ScoreRow[]>([])
  const [aggregates, setAggregates] = useState<Aggregates | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (!school_code) return

    // Find school
    const schools = schoolsData as School[]
    const foundSchool = schools.find(s => s.school_code === school_code)
    setSchool(foundSchool || null)

    // Get all score rows for this school
    const allScores = scoreRowsData as ScoreRow[]
    const schoolScores = allScores.filter(row => row.school_code === school_code)
    setScoreRows(schoolScores)

    // Get aggregates for this school
    const allAggregates = aggregatesData as Aggregates[]
    const schoolAggregates = allAggregates.find(a => a.school_code === school_code)
    setAggregates(schoolAggregates || null)
  }, [school_code])

  // Sort competencies by priority band and score
  const sortCompetencies = (competencies: ScoreRow[]): ScoreRow[] => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 }
    
    return [...competencies].sort((a, b) => {
      // First sort by priority band
      const priorityDiff = priorityOrder[a.priority_band] - priorityOrder[b.priority_band]
      if (priorityDiff !== 0) return priorityDiff
      
      // Within same band, sort by score ascending
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

  // Check if a grade has any data
  const gradeHasData = (grade: number): boolean => {
    return scoreRows.some(row => row.grade_level === grade)
  }

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!school) return

    setIsGeneratingPDF(true)
    try {
      await downloadSchoolPdf(school.school_code, language)
    } catch (error) {
      alert('Failed to generate PDF. Please try again.')
      console.error(error)
    } finally {
      setIsGeneratingPDF(false)
    }
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

  if (!school) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← {getLabel(language, 'backToDashboard')}
        </button>
        <div style={styles.error}>School not found</div>
      </div>
    )
  }

  // Define grade and subject order
  const grades = [6, 7, 8]
  const subjects = ['English', 'Mathematics', 'Social Science', 'Science']

  return (
    <div style={styles.container}>
      {/* Action Buttons (Not included in PDF) */}
      <div style={styles.actions} className="no-pdf">
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← {getLabel(language, 'backToDashboard')}
        </button>
        <LanguageToggle />
        <button 
          onClick={handleDownloadPDF} 
          style={{
            ...styles.downloadButton,
            ...(isGeneratingPDF ? styles.downloadButtonDisabled : {})
          }}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? getLabel(language, 'generating') : `📄 ${getLabel(language, 'downloadPdfReport')}`}
        </button>
      </div>

      {/* PDF Content */}
      <div style={styles.pdfContent}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.title}>{getLabel(language, 'reportTitle')}</h1>
          
          <div style={styles.schoolInfo}>
            <div style={styles.schoolName}>{school.school_name}</div>
            <div style={styles.schoolCode}>{getLabel(language, 'schoolCode')}: {school.school_code}</div>
          </div>
        </div>

      {/* Summary Tables */}
      <div style={styles.summarySection}>
        {/* 1. Subject Averages Table (Portrait Mode) */}
        <div style={styles.summaryTableContainer}>
          <h2 style={styles.summaryTitle}>{getLabel(language, 'subjectwiseAverages')}</h2>
          <table style={styles.summaryTable}>
            <thead>
              <tr>
                <th style={styles.summaryTh}>{getLabel(language, 'subject')}</th>
                <th style={styles.summaryThScore}>{getLabel(language, 'averageScore')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.summaryTdBold}>{getLabel(language, 'overallAverage')}</td>
                <td style={styles.summaryTdScore}>
                  <ScoreChip value={aggregates?.overall_avg ?? null} />
                </td>
              </tr>
              <tr>
                <td style={styles.summaryTd}>{getLabel(language, 'english')}</td>
                <td style={styles.summaryTdScore}>
                  <ScoreChip value={aggregates?.subject_avg_map.English ?? null} />
                </td>
              </tr>
              <tr>
                <td style={styles.summaryTd}>{getLabel(language, 'mathematics')}</td>
                <td style={styles.summaryTdScore}>
                  <ScoreChip value={aggregates?.subject_avg_map.Mathematics ?? null} />
                </td>
              </tr>
              <tr>
                <td style={styles.summaryTd}>{getLabel(language, 'science')}</td>
                <td style={styles.summaryTdScore}>
                  <ScoreChip value={aggregates?.subject_avg_map.Science ?? null} />
                </td>
              </tr>
              <tr>
                <td style={styles.summaryTd}>{getLabel(language, 'socialScience')}</td>
                <td style={styles.summaryTdScore}>
                  <ScoreChip value={aggregates?.subject_avg_map['Social Science'] ?? null} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Grade-Subject Priority Count Table */}
        <div style={styles.summaryTableContainer}>
          <h2 style={styles.summaryTitle}>{getLabel(language, 'priorityDistribution')}</h2>
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <strong>H</strong> = {getLabel(language, 'highPriority')}
            </span>
            <span style={styles.legendItem}>
              <strong>M</strong> = {getLabel(language, 'mediumPriority')}
            </span>
            <span style={styles.legendItem}>
              <strong>L</strong> = {getLabel(language, 'lowPriority')}
            </span>
            <span style={styles.legendItem}>
              <strong>-</strong> = {getLabel(language, 'noData')}
            </span>
          </div>
          {/* TABLE 1: English and Mathematics */}
          <div style={{ ...styles.tableScroll, pageBreakInside: 'avoid', breakInside: 'avoid' }} className="priority-table-wrapper">
            <table style={{ ...styles.priorityTable, pageBreakInside: 'avoid', breakInside: 'avoid' }} className="priority-table priority-table-1">
              <colgroup>
                <col style={{ width: '48px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.priorityThGrade} className="priorityThGrade" rowSpan={2}>{getLabel(language, 'grade')}</th>
                  <th style={styles.priorityTh} colSpan={3}>{getLabel(language, 'english')}</th>
                  <th style={styles.priorityTh} colSpan={3}>{getLabel(language, 'mathematics')}</th>
                </tr>
                <tr>
                  {/* English sub-columns */}
                  <th style={styles.priorityThSub} className="priorityThSub">H</th>
                  <th style={styles.priorityThSub} className="priorityThSub">M</th>
                  <th style={styles.priorityThSub} className="priorityThSub">L</th>
                  {/* Mathematics sub-columns */}
                  <th style={styles.priorityThSub} className="priorityThSub">H</th>
                  <th style={styles.priorityThSub} className="priorityThSub">M</th>
                  <th style={styles.priorityThSub} className="priorityThSub">L</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(grade => {
                  const english = getPriorityCounts(grade, 'English')
                  const math = getPriorityCounts(grade, 'Mathematics')

                  return (
                    <tr key={grade}>
                      <td style={styles.priorityTdGrade} className="priorityTdGrade">{grade}</td>
                      {/* English */}
                      <td style={styles.priorityTdHigh} className="priorityTdHigh">
                        {english.hasData ? english.high : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdMedium} className="priorityTdMedium">
                        {english.hasData ? english.medium : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdLow} className="priorityTdLow">
                        {english.hasData ? english.low : <span style={styles.noDataCell}>-</span>}
                      </td>
                      {/* Mathematics */}
                      <td style={styles.priorityTdHigh} className="priorityTdHigh">
                        {math.hasData ? math.high : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdMedium} className="priorityTdMedium">
                        {math.hasData ? math.medium : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdLow} className="priorityTdLow">
                        {math.hasData ? math.low : <span style={styles.noDataCell}>-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* TABLE 2: Science and Social Science */}
          <div style={{ ...styles.tableScroll, paddingTop: '30px', pageBreakInside: 'avoid', breakInside: 'avoid' }} className="priority-table-wrapper">
            <table style={{ ...styles.priorityTable, pageBreakInside: 'avoid', breakInside: 'avoid' }} className="priority-table priority-table-2">
              <colgroup>
                <col style={{ width: '48px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
                <col style={{ width: '56px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.priorityThGrade} className="priorityThGrade" rowSpan={2}>{getLabel(language, 'grade')}</th>
                  <th style={styles.priorityTh} colSpan={3}>{getLabel(language, 'science')}</th>
                  <th style={styles.priorityTh} colSpan={3}>{getLabel(language, 'socialScience')}</th>
                </tr>
                <tr>
                  {/* Science sub-columns */}
                  <th style={styles.priorityThSub} className="priorityThSub">H</th>
                  <th style={styles.priorityThSub} className="priorityThSub">M</th>
                  <th style={styles.priorityThSub} className="priorityThSub">L</th>
                  {/* Social Science sub-columns */}
                  <th style={styles.priorityThSub} className="priorityThSub">H</th>
                  <th style={styles.priorityThSub} className="priorityThSub">M</th>
                  <th style={styles.priorityThSub} className="priorityThSub">L</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(grade => {
                  const science = getPriorityCounts(grade, 'Science')
                  const socialScience = getPriorityCounts(grade, 'Social Science')

                  return (
                    <tr key={grade}>
                      <td style={styles.priorityTdGrade} className="priorityTdGrade">{grade}</td>
                      {/* Science */}
                      <td style={styles.priorityTdHigh} className="priorityTdHigh">
                        {science.hasData ? science.high : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdMedium} className="priorityTdMedium">
                        {science.hasData ? science.medium : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdLow} className="priorityTdLow">
                        {science.hasData ? science.low : <span style={styles.noDataCell}>-</span>}
                      </td>
                      {/* Social Science */}
                      <td style={styles.priorityTdHigh} className="priorityTdHigh">
                        {socialScience.hasData ? socialScience.high : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdMedium} className="priorityTdMedium">
                        {socialScience.hasData ? socialScience.medium : <span style={styles.noDataCell}>-</span>}
                      </td>
                      <td style={styles.priorityTdLow} className="priorityTdLow">
                        {socialScience.hasData ? socialScience.low : <span style={styles.noDataCell}>-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade Sections */}
      {grades.map(grade => {
        if (!gradeHasData(grade)) {
          const gradeLabel = `grade${grade}` as 'grade6' | 'grade7' | 'grade8'
          return (
            <div key={grade} style={styles.gradeSection}>
              <h2 style={styles.gradeHeader}>{getLabel(language, gradeLabel)}</h2>
              <div style={styles.noData}>{getLabel(language, 'noData')}</div>
            </div>
          )
        }

        const gradeLabel = `grade${grade}` as 'grade6' | 'grade7' | 'grade8'
        return (
          <div key={grade} style={styles.gradeSection} className="pdf-page-break">
            <h2 style={styles.gradeHeader}>{getLabel(language, gradeLabel)}</h2>

            {/* Subject Sections */}
            {subjects.map(subject => {
              const competencies = getCompetencies(grade, subject)

              if (competencies.length === 0) {
                return (
                  <div key={subject} style={styles.subjectSection}>
                    <h3 style={styles.subjectHeader}>{subject}</h3>
                    <div style={styles.noData}>No data available</div>
                  </div>
                )
              }

              return (
                <div key={subject} style={styles.subjectSection}>
                  <h3 style={styles.subjectHeader}>{subject}</h3>

                  {/* Competency Table */}
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>{getLabel(language, 'competency')}</th>
                        <th style={styles.thScore}>{getLabel(language, 'score')}</th>
                        <th style={styles.thPriority}>{getLabel(language, 'priority')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competencies.map((comp, index) => (
                        <tr key={index} style={styles.tr}>
                          <td style={styles.tdCompetency}>{comp.competency_name}</td>
                          <td style={styles.tdScore}>
                            <ScoreChip value={comp.score_10} />
                          </td>
                          <td style={styles.tdPriority}>
                            <span style={getPriorityBadgeStyle(comp.priority_band)}>
                              {comp.priority_band}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )
      })}

        {scoreRows.length === 0 && (
          <div style={styles.noDataGlobal}>
            No assessment data available for this school.
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for priority badge styling
function getPriorityBadgeStyle(priority: 'High' | 'Medium' | 'Low') {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  }

  switch (priority) {
    case 'High':
      return {
        ...baseStyle,
        backgroundColor: '#ffcccc',
        color: '#cc0000',
      }
    case 'Medium':
      return {
        ...baseStyle,
        backgroundColor: '#fff4cc',
        color: '#996600',
      }
    case 'Low':
      return {
        ...baseStyle,
        backgroundColor: '#ccffcc',
        color: '#006600',
      }
  }
}

// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  backButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
  },
  downloadButton: {
    padding: '10px 20px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
  },
  downloadButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  pdfContent: {
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: '32px',
    borderBottom: '2px solid #dee2e6',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '12px',
    marginTop: '0',
  },
  schoolInfo: {
    marginTop: '12px',
  },
  schoolName: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#495057',
    marginBottom: '4px',
  },
  schoolCode: {
    fontSize: '14px',
    color: '#6c757d',
  },
  gradeSection: {
    marginBottom: '40px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
  },
  gradeHeader: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#212529',
    marginTop: '0',
    marginBottom: '20px',
    paddingBottom: '8px',
    borderBottom: '2px solid #dee2e6',
  },
  subjectSection: {
    marginBottom: '24px',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  subjectHeader: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#495057',
    marginTop: '0',
    marginBottom: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    padding: '12px 8px',
    textAlign: 'left' as const,
    backgroundColor: '#e9ecef',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#495057',
    width: '60%',
  },
  thScore: {
    padding: '12px 8px',
    textAlign: 'center' as const,
    backgroundColor: '#e9ecef',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#495057',
    width: '20%',
  },
  thPriority: {
    padding: '12px 8px',
    textAlign: 'center' as const,
    backgroundColor: '#e9ecef',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#495057',
    width: '20%',
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
  },
  tdCompetency: {
    padding: '12px 8px',
    color: '#212529',
  },
  tdScore: {
    padding: '12px 8px',
    textAlign: 'center' as const,
  },
  tdPriority: {
    padding: '12px 8px',
    textAlign: 'center' as const,
  },
  noData: {
    padding: '16px',
    textAlign: 'center' as const,
    color: '#6c757d',
    fontStyle: 'italic' as const,
    fontSize: '14px',
  },
  noDataGlobal: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#6c757d',
    fontSize: '16px',
  },
  error: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#dc3545',
    fontSize: '16px',
  },
  // Summary section styles
  summarySection: {
    marginBottom: '32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },
  summaryTableContainer: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#212529',
    marginTop: '0',
    marginBottom: '16px',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  summaryTh: {
    padding: '12px',
    textAlign: 'left' as const,
    backgroundColor: '#e9ecef',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#495057',
    width: '60%',
  },
  summaryThScore: {
    padding: '12px',
    textAlign: 'center' as const,
    backgroundColor: '#e9ecef',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#495057',
    width: '40%',
  },
  summaryTd: {
    padding: '10px 12px',
    borderBottom: '1px solid #dee2e6',
    color: '#495057',
  },
  summaryTdBold: {
    padding: '10px 12px',
    borderBottom: '1px solid #dee2e6',
    color: '#212529',
    fontWeight: 600,
  },
  summaryTdScore: {
    padding: '10px 12px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #dee2e6',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#6c757d',
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    display: 'flex',
    gap: '4px',
  },
  tableScroll: {
    overflowX: 'auto' as const,
  },
  priorityTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
    minWidth: '800px',
  },
  priorityThGrade: {
    padding: '10px 12px',
    textAlign: 'center' as const,
    backgroundColor: '#495057',
    color: '#ffffff',
    fontWeight: 600,
    border: '1px solid #dee2e6',
  },
  priorityTh: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    backgroundColor: '#6c757d',
    color: '#ffffff',
    fontWeight: 600,
    border: '1px solid #dee2e6',
    fontSize: '12px',
  },
  priorityThSub: {
    padding: '8px 6px',
    textAlign: 'center' as const,
    backgroundColor: '#adb5bd',
    color: '#212529',
    fontWeight: 600,
    border: '1px solid #dee2e6',
    fontSize: '11px',
  },
  priorityTdGrade: {
    padding: '10px 12px',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    border: '1px solid #dee2e6',
  },
  priorityTd: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    border: '1px solid #dee2e6',
  },
  priorityTdHigh: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    border: '1px solid #dee2e6',
    backgroundColor: '#ffe6e6',
    fontWeight: 600,
    color: '#cc0000',
  },
  priorityTdMedium: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    border: '1px solid #dee2e6',
    backgroundColor: '#fff9e6',
    fontWeight: 600,
    color: '#996600',
  },
  priorityTdLow: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    border: '1px solid #dee2e6',
    backgroundColor: '#e6ffe6',
    fontWeight: 600,
    color: '#006600',
  },
  noDataCell: {
    color: '#adb5bd',
    fontStyle: 'italic' as const,
  },
}

export default SchoolReport
