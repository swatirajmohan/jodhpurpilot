import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aggregates, School } from '../types'
import ScoreChip from '../components/ScoreChip'
import schoolsData from '../data/schools.json'
import aggregatesData from '../data/aggregates.json'
import { generatePdfFromBackend } from '../utils/pdfBackend'
import { downloadBlob } from '../utils/download'
import { downloadAllPdfsAsZip } from '../utils/downloadAllPdfsAsZip'
import { transformPdfPayload } from '../utils/transformPdfData'
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
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)
  const [downloadingGradePdf, setDownloadingGradePdf] = useState<{ school: string; grade: number } | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

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

  // Handle PDF download (full school report)
  const handleDownloadPdf = async (school_code: string) => {
    setDownloadingPdf(school_code)
    
    try {
      console.log('PDF_DOWNLOAD_START', school_code, language)
      
      // Find school data
      const school = tableData.find(s => s.school_code === school_code)
      if (!school) {
        throw new Error('School not found')
      }
      
      // Get competencies for this school
      const allScoreRows = scoreRowsData as any[]
      const competencies = allScoreRows.filter((row: any) => row.school_code === school_code)
      
      // Build payload for full school report
      const payload = {
        school: {
          school_code: school.school_code,
          school_name: school.school_name
        },
        aggregates: school.aggregates || null,
        competencies,
        lang: language,
        reportType: 'full' // Full school report
      }
      
      // STEP 8: Frontend sanity check
      console.log('SENDING PDF DATA (before transform):', payload)
      
      if (!payload.school || !payload.competencies || payload.competencies.length === 0) {
        throw new Error('Incomplete PDF data - refusing to send')
      }
      
      // Transform data to target language
      const transformedPayload = transformPdfPayload(payload)
      console.log('SENDING PDF DATA (after transform):', transformedPayload)
      console.log('PDF_PAYLOAD_SAMPLE', language, transformedPayload.competencies?.[0]?.competency_name)
      
      // Call backend to generate PDF
      const blob = await generatePdfFromBackend(transformedPayload)
      
      console.log('PDF_BLOB_RECEIVED', blob.size)
      
      // Download using robust blob download
      const filename = `${school.school_code}_full_${language}.pdf`
      downloadBlob(blob, filename)
      
      console.log('PDF_DOWNLOAD_TRIGGERED')
    } catch (error) {
      console.error('PDF_ERROR', error)
      alert(`Failed to download PDF: ${(error as Error).message}`)
    } finally {
      setDownloadingPdf(null)
    }
  }

  // Handle grade-specific PDF download
  const handleDownloadGradePdf = async (school_code: string, gradeLevel: 6 | 7 | 8) => {
    setDownloadingGradePdf({ school: school_code, grade: gradeLevel })
    
    try {
      console.log('GRADE_PDF_DOWNLOAD_START', school_code, gradeLevel, language)
      
      // Find school data
      const school = tableData.find(s => s.school_code === school_code)
      if (!school) {
        throw new Error('School not found')
      }
      
      // Get competencies for this school and grade
      const allScoreRows = scoreRowsData as any[]
      const competencies = allScoreRows.filter(
        (row: any) => row.school_code === school_code && row.grade_level === gradeLevel
      )
      
      if (competencies.length === 0) {
        alert(`No data available for Grade ${gradeLevel}`)
        return
      }
      
      // Build payload for grade-specific report
      const payload = {
        school: {
          school_code: school.school_code,
          school_name: school.school_name
        },
        aggregates: school.aggregates || null,
        competencies, // Already filtered to this grade
        lang: language,
        reportType: 'grade', // Grade-specific report
        gradeLevel // Specify which grade
      }
      
      console.log('SENDING GRADE PDF DATA (before transform):', payload)
      
      // Transform data to target language
      const transformedPayload = transformPdfPayload(payload)
      console.log('SENDING GRADE PDF DATA (after transform):', transformedPayload)
      
      // Call backend to generate PDF
      const blob = await generatePdfFromBackend(transformedPayload)
      
      console.log('GRADE_PDF_BLOB_RECEIVED', blob.size)
      
      // Download using robust blob download
      const filename = `${school.school_code}_grade${gradeLevel}_${language}.pdf`
      downloadBlob(blob, filename)
      
      console.log('GRADE_PDF_DOWNLOAD_TRIGGERED')
    } catch (error) {
      console.error('GRADE_PDF_ERROR', error)
      alert(`Failed to download Grade ${gradeLevel} PDF: ${(error as Error).message}`)
    } finally {
      setDownloadingGradePdf(null)
    }
  }

  // Handle bulk PDF download as ZIP
  const handleDownloadAllPdfs = async () => {
    setDownloadingAll(true)
    
    try {
      await downloadAllPdfsAsZip(language, (progress) => {
        console.log(`Progress: ${progress.current}/${progress.total}, Failures: ${progress.failures.length}`)
      })
    } catch (error) {
      console.error('BULK_ERROR', error)
      alert(`Bulk download error: ${(error as Error).message}`)
    } finally {
      setDownloadingAll(false)
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{getLabel(language, 'dashboardTitle')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleDownloadAllPdfs}
            disabled={downloadingAll}
            className={styles.actionButton}
            style={{ minWidth: '180px' }}
          >
            {downloadingAll ? 'Creating ZIP...' : 'Download All PDFs'}
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
              <th rowSpan={2}>Grade 6 PDF</th>
              <th rowSpan={2}>Grade 7 PDF</th>
              <th rowSpan={2}>Grade 8 PDF</th>
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
                    disabled={downloadingPdf === row.school_code}
                    title="Download Full School Report"
                  >
                    {downloadingPdf === row.school_code ? getLabel(language, 'generating') : getLabel(language, 'downloadPdf')}
                  </button>
                </td>
                <td className={styles.actionCell}>
                  <button
                    onClick={() => handleDownloadGradePdf(row.school_code, 6)}
                    className={styles.actionButton}
                    disabled={downloadingGradePdf?.school === row.school_code && downloadingGradePdf?.grade === 6}
                    title="Download Grade 6 Report"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  >
                    {downloadingGradePdf?.school === row.school_code && downloadingGradePdf?.grade === 6 ? '...' : 'G6'}
                  </button>
                </td>
                <td className={styles.actionCell}>
                  <button
                    onClick={() => handleDownloadGradePdf(row.school_code, 7)}
                    className={styles.actionButton}
                    disabled={downloadingGradePdf?.school === row.school_code && downloadingGradePdf?.grade === 7}
                    title="Download Grade 7 Report"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  >
                    {downloadingGradePdf?.school === row.school_code && downloadingGradePdf?.grade === 7 ? '...' : 'G7'}
                  </button>
                </td>
                <td className={styles.actionCell}>
                  <button
                    onClick={() => handleDownloadGradePdf(row.school_code, 8)}
                    className={styles.actionButton}
                    disabled={downloadingGradePdf?.school === row.school_code && downloadingGradePdf?.grade === 8}
                    title="Download Grade 8 Report"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  >
                    {downloadingGradePdf?.school === row.school_code && downloadingGradePdf?.grade === 8 ? '...' : 'G8'}
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
