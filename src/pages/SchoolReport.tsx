import { useParams } from 'react-router-dom'

function SchoolReport() {
  const { school_code } = useParams<{ school_code: string }>()

  return (
    <div>
      <h1>School Report - {school_code}</h1>
      <p>Detailed report view will be implemented in Phase 4</p>
    </div>
  )
}

export default SchoolReport

