/**
 * PDF Backend Client
 * Calls Node.js backend with Puppeteer for PDF generation
 */

const BACKEND_URL = import.meta.env.VITE_PDF_BACKEND_URL || 'http://localhost:3001';

export interface PdfRequestData {
  school: {
    school_code: string;
    school_name: string;
  };
  aggregates: any;
  competencies: any[];
  lang: 'en' | 'hi';
}

export async function generatePdfFromBackend(data: PdfRequestData): Promise<Blob> {
  try {
    const response = await fetch(`${BACKEND_URL}/generate-pdf`, {
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
    return blob;
  } catch (error) {
    console.error('PDF Backend Error:', error);
    throw error;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

