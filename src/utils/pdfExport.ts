/**
 * PDF Export Utility
 * 
 * Client-side PDF generation for School Report Cards
 * Uses html2pdf.js to convert the report card HTML to PDF
 */

// @ts-ignore - html2pdf.js doesn't have TypeScript definitions
import html2pdf from 'html2pdf.js'

/**
 * Sanitize school name for safe file naming
 * Removes special characters and spaces
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50) // Limit length
}

/**
 * Generate PDF from School Report Card
 * 
 * @param school_code - School code
 * @param school_name - School name
 * @param element - HTML element to convert to PDF
 */
export async function generateSchoolReportPDF(
  school_code: string,
  school_name: string,
  element: HTMLElement
): Promise<void> {
  const sanitizedName = sanitizeFileName(school_name)
  const fileName = `${school_code}_${sanitizedName}_report.pdf`

  const options = {
    margin: [8, 8, 8, 8], // [top, left, bottom, right] in mm - reduced margins
    filename: fileName,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
      scale: 1.5, // Reduced scale for better fitting
      useCORS: true,
      letterRendering: true,
      logging: false,
      windowWidth: 1200, // Fixed width for consistent rendering
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.pdf-page-break',
      avoid: ['.summary-table-container', '.subject-section'],
    },
  }

  try {
    await html2pdf().set(options).from(element).save()
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

/**
 * Download School Report as PDF
 * Creates a hidden container, renders the report, generates PDF, and cleans up
 * 
 * @param school_code - School code
 * @param school_name - School name  
 * @param reportElement - The report card element to print
 */
export async function downloadSchoolReportPDF(
  school_code: string,
  school_name: string,
  reportElement: HTMLElement
): Promise<void> {
  // Clone the element to avoid affecting the visible UI
  const clonedElement = reportElement.cloneNode(true) as HTMLElement
  
  // Add PDF-specific class for styling
  clonedElement.classList.add('pdf-mode')
  
  // Create temporary container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.appendChild(clonedElement)
  document.body.appendChild(container)

  try {
    await generateSchoolReportPDF(school_code, school_name, clonedElement)
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}

