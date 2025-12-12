import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SchoolReport from './pages/SchoolReport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/school/:school_code" element={<SchoolReport />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

