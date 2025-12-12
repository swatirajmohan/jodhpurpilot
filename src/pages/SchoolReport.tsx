import { useParams, useNavigate } from 'react-router-dom'

function SchoolReport() {
  const { school_code } = useParams<{ school_code: string }>()
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Back to Dashboard
      </button>
      
      <h1 style={styles.title}>School Report for {school_code}</h1>
      
      <div style={styles.placeholder}>
        <p>Detailed report view will be implemented in Phase 4</p>
        <p style={styles.note}>
          This page will show:
          <ul>
            <li>School name and details</li>
            <li>Grade tabs (6, 7, 8)</li>
            <li>Subject tabs per grade</li>
            <li>Competency-level scores with priority bands</li>
          </ul>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  backButton: {
    padding: '8px 16px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  placeholder: {
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  note: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#666',
  },
}

export default SchoolReport

