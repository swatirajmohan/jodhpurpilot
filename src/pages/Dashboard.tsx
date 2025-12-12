import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aggregates, School } from '../types'
import ScoreChip from '../components/ScoreChip'
import schoolsData from '../data/schools.json'
import aggregatesData from '../data/aggregates.json'
import { downloadSchoolPdf } from '../pdf/downloadPdf'
import styles from './Dashboard.module.css'

// Type for combined school data with aggregates
interface SchoolTableRow {
  school_code: string;
  school_name: string;
  aggregates: Aggregates;
}

function Dashboard() {
  const navigate = useNavigate()
  
  // State
  const [tableData, setTableData] = useState<SchoolTableRow[]>([])
  const [filteredData, setFilteredData] = useState<SchoolTableRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    // Combine schools with their aggregates
    const schools = schoolsData as School[]
    const aggregates = aggregatesData as Aggregates[]
    
    const combined: SchoolTableRow[] = schools.map(school => {
      const schoolAggregates = aggregates.find(
        agg => agg.school_code === school.school_code
      )
      
      return {
        school_code: school.school_code,
        school_name: school.school_name,
        aggregates: schoolAggregates || {
          school_code: school.school_code,
          overall_avg: null,
          subject_avg_map: {
            English: null,
            Mathematics: null,
            Science: null,
            'Social Science': null,
          },
        },
      }
    })

    setTableData(combined)
    setFilteredData(combined)
  }, [])

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(tableData)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = tableData.filter(row => 
      row.school_name.toLowerCase().includes(query) ||
      row.school_code.includes(query)
    )
    
    setFilteredData(filtered)
  }, [searchQuery, tableData])

  // Sort by Overall Average
  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc'
    setSortOrder(newOrder)
    
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a.aggregates.overall_avg
      const bValue = b.aggregates.overall_avg
      
      // Null values always go to the bottom
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1
      
      // Sort by value
      return newOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
    
    setFilteredData(sorted)
  }

  // Navigate to school detail page
  const handleViewReport = (school_code: string) => {
    navigate(`/school/${school_code}`)
  }

  // Handle row double-click
  const handleRowDoubleClick = (school_code: string) => {
    navigate(`/school/${school_code}`)
  }

  // Handle PDF download
  const handleDownloadPdf = async (school_code: string) => {
    setDownloadingPdf(school_code)
    try {
      await downloadSchoolPdf(school_code)
    } catch (error) {
      alert('Failed to generate PDF. Please try again.')
      console.error(error)
    } finally {
      setDownloadingPdf(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Jodhpur School Assessment Dashboard</h1>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by school name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchBox}
        />
        <span className={styles.resultCount}>
          Showing {filteredData.length} of {tableData.length} schools
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th rowSpan={2} className={styles.textHeader}>School Name</th>
              <th rowSpan={2} className={styles.textHeader}>School Code</th>
              <th rowSpan={2} onClick={handleSort} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Overall School Average
                <span className={styles.sortButton}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
              </th>
              <th colSpan={5}>Grade 6 Average</th>
              <th colSpan={5}>Grade 7 Average</th>
              <th colSpan={5}>Grade 8 Average</th>
              <th rowSpan={2}>View Report</th>
              <th rowSpan={2}>Download PDF</th>
            </tr>
            <tr>
              {/* Grade 6 sub-columns */}
              <th>Overall</th>
              <th>English</th>
              <th>Mathematics</th>
              <th>Social Science</th>
              <th>Science</th>
              {/* Grade 7 sub-columns */}
              <th>Overall</th>
              <th>English</th>
              <th>Mathematics</th>
              <th>Social Science</th>
              <th>Science</th>
              {/* Grade 8 sub-columns */}
              <th>Overall</th>
              <th>English</th>
              <th>Mathematics</th>
              <th>Social Science</th>
              <th>Science</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr
                key={row.school_code}
                onDoubleClick={() => handleRowDoubleClick(row.school_code)}
              >
                <td className={styles.textCell}>{row.school_name}</td>
                <td className={styles.textCell}>{row.school_code}</td>
                <td>
                  <ScoreChip value={row.aggregates.overall_avg} />
                </td>
                
                {/* Grade 6 columns */}
                <td>
                  <ScoreChip value={row.aggregates.grade_avg_map?.[6] ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.English ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.Mathematics ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.['Social Science'] ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.Science ?? null} />
                </td>

                {/* Grade 7 columns */}
                <td>
                  <ScoreChip value={row.aggregates.grade_avg_map?.[7] ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.English ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.Mathematics ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.['Social Science'] ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.Science ?? null} />
                </td>

                {/* Grade 8 columns */}
                <td>
                  <ScoreChip value={row.aggregates.grade_avg_map?.[8] ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.English ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.Mathematics ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.['Social Science'] ?? null} />
                </td>
                <td>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.Science ?? null} />
                </td>

                {/* Action buttons */}
                <td className={styles.actionCell}>
                  <button
                    onClick={() => handleViewReport(row.school_code)}
                    className={styles.actionButton}
                  >
                    View Report
                  </button>
                </td>
                <td className={styles.actionCell}>
                  <button
                    onClick={() => handleDownloadPdf(row.school_code)}
                    className={styles.actionButton}
                    disabled={downloadingPdf === row.school_code}
                    title="Download PDF report"
                  >
                    {downloadingPdf === row.school_code ? 'Generating...' : 'Download PDF'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
