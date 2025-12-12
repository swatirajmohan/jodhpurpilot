/**
 * pdfmake Fonts Configuration
 * Lazy initialization - does NOT run at module load
 */

// Font configuration (safe to export)
export const fonts = {
  en: 'Roboto',
  hi: 'Roboto', // Roboto includes basic Devanagari support
}

let pdfMakeInstance: any = null
let isInitialized = false

/**
 * Initialize pdfMake lazily - only called when actually needed
 */
export function initializePdfMake(): any {
  if (isInitialized && pdfMakeInstance) {
    return pdfMakeInstance
  }

  // Dynamic import to prevent module-load-time execution
  const pdfMake = require('pdfmake/build/pdfmake')
  const pdfFonts = require('pdfmake/build/vfs_fonts')

  // Type assertion to access vfs
  const pdfMakeAny = pdfMake as any
  const pdfFontsAny = pdfFonts as any

  // Register standard fonts
  pdfMakeAny.vfs = pdfFontsAny.vfs

  // Configure pdfMake to use the fonts
  pdfMakeAny.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  }

  pdfMakeInstance = pdfMakeAny
  isInitialized = true

  return pdfMakeInstance
}

/**
 * Get pdfMake instance (initializes if needed)
 */
export function getPdfMake(): any {
  return initializePdfMake()
}

