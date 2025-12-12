/**
 * Safe pdfMake loader
 * Uses dynamic imports to prevent module-load-time execution
 */

let pdfMakeInstance: any = null

export async function loadPdfMake() {
  // Return cached instance if already loaded
  if (pdfMakeInstance) {
    return pdfMakeInstance
  }

  // Dynamic imports - only loads when called
  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

  // Extract pdfMake (handle both default and named exports)
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule

  // Register fonts
  pdfMake.vfs = (pdfFontsModule as any).pdfMake.vfs

  // Configure fonts
  pdfMake.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  }

  // Cache instance
  pdfMakeInstance = pdfMake

  return pdfMake
}

