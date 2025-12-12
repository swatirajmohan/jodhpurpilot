import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { School, ScoreRow } from '../types'
import ScoreChip from '../components/ScoreChip'
import schoolsData from '../data/schools.json'
import scoreRowsData from '../data/score_rows.json'

function SchoolReport() {
  const { school_code } = useParams<{ school_code: string }>()
  const navigate = useNavigate()

  // State
  const [school, setSchool] = useState<School | null>(null)
  const [scoreRows, setScoreRows] = useState<ScoreRow[]>([])

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

  if (!school) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Dashboard
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
      {/* Header Section */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        
        <h1 style={styles.title}>School Assessment Report</h1>
        
        <div style={styles.schoolInfo}>
          <div style={styles.schoolName}>{school.school_name}</div>
          <div style={styles.schoolCode}>School Code: {school.school_code}</div>
        </div>
      </div>

      {/* Grade Sections */}
      {grades.map(grade => {
        if (!gradeHasData(grade)) {
          return (
            <div key={grade} style={styles.gradeSection}>
              <h2 style={styles.gradeHeader}>Grade {grade}</h2>
              <div style={styles.noData}>No assessment data available for Grade {grade}</div>
            </div>
          )
        }

        return (
          <div key={grade} style={styles.gradeSection}>
            <h2 style={styles.gradeHeader}>Grade {grade}</h2>

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
                        <th style={styles.th}>Competency</th>
                        <th style={styles.thScore}>Score</th>
                        <th style={styles.thPriority}>Priority</th>
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
  header: {
    marginBottom: '32px',
    borderBottom: '2px solid #dee2e6',
    paddingBottom: '20px',
  },
  backButton: {
    padding: '8px 16px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    display: 'inline-block',
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
}

export default SchoolReport
