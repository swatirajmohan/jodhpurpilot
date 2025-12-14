/**
 * API Configuration
 * Backend base URL from environment or default to localhost
 */

export const API_CONFIG = {
  PDF_BACKEND_URL: import.meta.env.VITE_PDF_API_BASE || 'http://localhost:3001'
} as const;


