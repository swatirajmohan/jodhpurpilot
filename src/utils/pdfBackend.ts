/**
 * PDF Backend Client
 * Calls Node.js backend for PDF generation
 */

import { API_CONFIG } from '../config/api';

export interface PdfRequestData {
  school: {
    school_code: string;
    school_name: string;
  };
  aggregates?: any;
  competencies?: any[];
  lang: 'en' | 'hi';
}

/**
 * Generate PDF from backend
 * Returns blob ready for download
 */
export async function generatePdfFromBackend(data: PdfRequestData): Promise<Blob> {
  const response = await fetch(`${API_CONFIG.PDF_BACKEND_URL}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Server returned ${response.status}`);
  }

  const blob = await response.blob();
  
  if (blob.size === 0) {
    throw new Error('Empty PDF received from server');
  }
  
  return blob;
}

