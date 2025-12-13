import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aggregates, School } from '../types'
import ScoreChip from '../components/ScoreChip'
import schoolsData from '../data/schools.json'
import aggregatesData from '../data/aggregates.json'
import { loadPdfMake } from '../pdf/loadPdfMake'
import { sanitiseDocDefinition } from '../pdf/sanitiseDocDefinition'
import { buildSchoolReportPdf } from '../pdf/buildSchoolReportPdf'
import schoolsFullData from '../data/schools.json'
import scoreRowsData from '../data/score_rows.json'
import { useLanguage } from '../contexts/LanguageContext'
import { getLabel } from '../i18n/labels'
import { LanguageToggle } from '../components/LanguageToggle'
import styles from './Dashboard.module.css'

// Type for combined school data with aggregates
interface SchoolTableRow {
  school_code: string;
  school_name: string;
  aggregates: Aggregates;
}

function Dashboard() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  
  // State
  const [tableData, setTableData] = useState<SchoolTableRow[]>([])
  const [filteredData, setFilteredData] = useState<SchoolTableRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pdfMakeInstance, setPdfMakeInstance] = useState<any>(null)

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

  // Preload pdfMake on mount (CRITICAL: must load before user clicks)
  useEffect(() => {
    loadPdfMake().then(setPdfMakeInstance).catch(err => {
      console.error('Failed to load pdfMake:', err)
    })
  }, [])

  // Prebuild test PDF doc (synchronous, no async in click)
  const testPdfDoc = useMemo(() => {
    return sanitiseDocDefinition({
      content: [
        { text: "PDF test OK", font: "Roboto" },
        { text: "हिंदी परीक्षण सफल", font: "NotoSansDevanagari" }
      ]
    })
  }, [])

  // Prebuild all docDefinitions for filtered schools (synchronous, no async in click)
  const preparedDocs = useMemo(() => {
    const schools = schoolsFullData as School[]
    const allScoreRows = scoreRowsData as any[]
    const aggregates = aggregatesData as Aggregates[]
    const docs: Record<string, any> = {}

    filteredData.forEach(row => {
      const school = schools.find(s => s.school_code === row.school_code)
      if (!school) return

      const schoolScoreRows = allScoreRows.filter((r: any) => r.school_code === row.school_code)
      const schoolAggregates = aggregates.find(a => a.school_code === row.school_code) || null

      const docDefinition = buildSchoolReportPdf({
        school,
        aggregates: schoolAggregates,
        scoreRows: schoolScoreRows,
        lang: language,
      })

      docs[row.school_code] = sanitiseDocDefinition(docDefinition)
    })

    return docs
  }, [filteredData, language])

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
  // SYNCHRONOUS handler (no async, no await - CRITICAL for .open() to work)
  const handleDownloadPdf = (school_code: string) => {
    if (!pdfMakeInstance) {
      alert('PDF engine not ready yet. Please wait a moment and try again.')
      return
    }

    const preparedDoc = preparedDocs[school_code]
    if (!preparedDoc) {
      alert('PDF document not ready for this school.')
      return
    }

    console.log('PDF_CLICK', school_code, language)
    
    // MUST be called synchronously (same call stack as click)
    pdfMakeInstance.createPdf(preparedDoc).open()
    
    console.log('OPEN_CALLED')
  }

  // SYNCHRONOUS handler for bulk (no async, no await - CRITICAL for .open() to work)
  const handleDownloadAllPdfs = () => {
    if (!pdfMakeInstance) {
      alert('PDF engine not ready yet. Please wait a moment and try again.')
      return
    }

    const docsToOpen = Object.entries(preparedDocs)
    if (docsToOpen.length === 0) {
      alert('No PDFs ready to open.')
      return
    }

    console.log('BULK_OPEN_START', docsToOpen.length)

    // Open all PDFs synchronously (browser may limit tabs, that's expected)
    docsToOpen.forEach(([school_code, doc], index) => {
      console.log(`BULK_OPEN_${index + 1}`, school_code)
      pdfMakeInstance.createPdf(doc).open()
    })

    alert(`Opened ${docsToOpen.length} PDFs in new tabs. Please save them manually.`)
  }

  // SYNCHRONOUS test handler (no async, no await - CRITICAL for .open() to work)
  const handleTestPdf = () => {
    if (!pdfMakeInstance) {
      alert('PDF engine not ready yet. Please wait a moment and try again.')
      return
    }

    console.log('TEST_PDF_CLICK')
    
    // MUST be called synchronously (same call stack as click)
    pdfMakeInstance.createPdf(testPdfDoc).open()
    
    console.log('TEST_PDF_OPENED')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{getLabel(language, 'dashboardTitle')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleTestPdf}
            className={styles.actionButton}
            style={{ minWidth: '120px', backgroundColor: '#4CAF50', color: 'white' }}
          >
            Test PDF
          </button>
          <button
            onClick={handleDownloadAllPdfs}
            disabled={!pdfMakeInstance}
            className={styles.actionButton}
            style={{ minWidth: '180px' }}
          >
            Open All PDFs
          </button>
          <LanguageToggle />
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder={getLabel(language, 'searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchBox}
        />
        <span className={styles.resultCount}>
          {getLabel(language, 'showingResults')} {filteredData.length} {getLabel(language, 'of')} {tableData.length} {getLabel(language, 'schools')}
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th rowSpan={2} className={styles.textHeader}>{getLabel(language, 'schoolName')}</th>
              <th rowSpan={2} className={styles.textHeader}>{getLabel(language, 'schoolCode')}</th>
              <th rowSpan={2} onClick={handleSort} style={{ cursor: 'pointer', userSelect: 'none' }}>
                {getLabel(language, 'overallAverage')}
                <span className={styles.sortButton}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
              </th>
              <th colSpan={5}>{getLabel(language, 'grade6Average')}</th>
              <th colSpan={5}>{getLabel(language, 'grade7Average')}</th>
              <th colSpan={5}>{getLabel(language, 'grade8Average')}</th>
              <th rowSpan={2}>{getLabel(language, 'viewReport')}</th>
              <th rowSpan={2}>{getLabel(language, 'downloadPdf')}</th>
            </tr>
            <tr>
              {/* Grade 6 sub-columns */}
              <th>{getLabel(language, 'overall')}</th>
              <th>{getLabel(language, 'english')}</th>
              <th>{getLabel(language, 'mathematics')}</th>
              <th>{getLabel(language, 'socialScience')}</th>
              <th>{getLabel(language, 'science')}</th>
              {/* Grade 7 sub-columns */}
              <th>{getLabel(language, 'overall')}</th>
              <th>{getLabel(language, 'english')}</th>
              <th>{getLabel(language, 'mathematics')}</th>
              <th>{getLabel(language, 'socialScience')}</th>
              <th>{getLabel(language, 'science')}</th>
              {/* Grade 8 sub-columns */}
              <th>{getLabel(language, 'overall')}</th>
              <th>{getLabel(language, 'english')}</th>
              <th>{getLabel(language, 'mathematics')}</th>
              <th>{getLabel(language, 'socialScience')}</th>
              <th>{getLabel(language, 'science')}</th>
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
                    {getLabel(language, 'viewReport')}
                  </button>
                </td>
                <td className={styles.actionCell}>
                  <button
                    onClick={() => handleDownloadPdf(row.school_code)}
                    className={styles.actionButton}
                    disabled={!pdfMakeInstance}
                    title={getLabel(language, 'downloadPdf')}
                  >
                    {getLabel(language, 'downloadPdf')}
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
