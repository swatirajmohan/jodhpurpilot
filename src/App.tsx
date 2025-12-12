import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SchoolReport from './pages/SchoolReport'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/school/:school_code" element={<SchoolReport />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App

