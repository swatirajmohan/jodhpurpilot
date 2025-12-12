import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aggregates, School } from '../types'
import ScoreChip from '../components/ScoreChip'
import schoolsData from '../data/schools.json'
import aggregatesData from '../data/aggregates.json'

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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Jodhpur School Assessment Dashboard</h1>
      
      {/* Search input */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by school name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={styles.resultsInfo}>
        Showing {filteredData.length} of {tableData.length} schools
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th rowSpan={2} style={styles.th}>School Name</th>
              <th rowSpan={2} style={styles.th}>School Code</th>
              <th rowSpan={2} style={{...styles.th, ...styles.sortable}} onClick={handleSort}>
                Overall School Average {sortOrder === 'desc' ? '↓' : '↑'}
              </th>
              <th colSpan={5} style={styles.th}>Grade 6 Average</th>
              <th colSpan={5} style={styles.th}>Grade 7 Average</th>
              <th colSpan={5} style={styles.th}>Grade 8 Average</th>
              <th rowSpan={2} style={styles.th}>View detailed report</th>
              <th rowSpan={2} style={styles.th}>Download detailed report (PDF)</th>
            </tr>
            <tr>
              {/* Grade 6 sub-columns */}
              <th style={styles.th}>Overall</th>
              <th style={styles.th}>English</th>
              <th style={styles.th}>Mathematics</th>
              <th style={styles.th}>Social Science</th>
              <th style={styles.th}>Science</th>
              {/* Grade 7 sub-columns */}
              <th style={styles.th}>Overall</th>
              <th style={styles.th}>English</th>
              <th style={styles.th}>Mathematics</th>
              <th style={styles.th}>Social Science</th>
              <th style={styles.th}>Science</th>
              {/* Grade 8 sub-columns */}
              <th style={styles.th}>Overall</th>
              <th style={styles.th}>English</th>
              <th style={styles.th}>Mathematics</th>
              <th style={styles.th}>Social Science</th>
              <th style={styles.th}>Science</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr
                key={row.school_code}
                onDoubleClick={() => handleRowDoubleClick(row.school_code)}
                style={styles.tr}
              >
                <td style={styles.td}>{row.school_name}</td>
                <td style={styles.td}>{row.school_code}</td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.overall_avg} />
                </td>
                
                {/* Grade 6 columns */}
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_avg_map?.[6] ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.English ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.Mathematics ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.['Social Science'] ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[6]?.Science ?? null} />
                </td>

                {/* Grade 7 columns */}
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_avg_map?.[7] ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.English ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.Mathematics ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.['Social Science'] ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[7]?.Science ?? null} />
                </td>

                {/* Grade 8 columns */}
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_avg_map?.[8] ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.English ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.Mathematics ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.['Social Science'] ?? null} />
                </td>
                <td style={styles.td}>
                  <ScoreChip value={row.aggregates.grade_subject_avg_map?.[8]?.Science ?? null} />
                </td>

                {/* Action buttons */}
                <td style={styles.td}>
                  <button
                    onClick={() => handleViewReport(row.school_code)}
                    style={styles.button}
                  >
                    View Report
                  </button>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.button}
                    disabled
                    title="PDF export coming in Phase 5"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div style={styles.noResults}>
          No schools found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}

// Minimal inline styles
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  searchContainer: {
    marginBottom: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  searchInput: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '300px',
  },
  clearButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
  },
  resultsInfo: {
    marginBottom: '12px',
    fontSize: '14px',
    color: '#666',
  },
  tableContainer: {
    overflowX: 'auto' as const,
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '10px 8px',
    textAlign: 'left' as const,
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontSize: '12px',
    fontWeight: 600,
    color: '#495057',
  },
  sortable: {
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #eee',
    fontSize: '13px',
  },
  tr: {
    cursor: 'pointer',
  },
  button: {
    padding: '6px 12px',
    fontSize: '12px',
    border: '1px solid #007bff',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  noResults: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#999',
    fontSize: '14px',
  },
}

export default Dashboard
