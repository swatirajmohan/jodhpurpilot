/**
 * pdfmake Fonts Configuration
 * Registers fonts for English and Hindi
 */

import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'

// Type assertion to access vfs
const pdfMakeAny = pdfMake as any
const pdfFontsAny = pdfFonts as any

// Register standard fonts
pdfMakeAny.vfs = pdfFontsAny.vfs

// Font configuration
export const fonts = {
  en: 'Roboto',
  hi: 'Roboto', // Roboto includes basic Devanagari support
}

// Configure pdfMake to use the fonts
pdfMakeAny.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
}

export default pdfMakeAny

