/**
 * PDF Font Registration
 * Fonts are registered ONCE at module load
 * No conditions, no language checks
 */

import { Font } from '@react-pdf/renderer'

// Register font family - executed once at import
Font.register({
  family: 'ReportFont',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosans/v30/o-0IIpQlx3QUlC5A4PNjXhFVZNyB.woff2',
    },
    {
      src: 'https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGUUVpzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlXQly-AzoFoW4Ow.woff2',
    },
  ],
})

// Export font family name
export const PDF_FONT_FAMILY = 'ReportFont'

