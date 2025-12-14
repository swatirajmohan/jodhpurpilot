/**
 * NO-OP Transform - Keep data in English for backend processing
 * Backend template handles all language translation
 * 
 * CRITICAL: Subject keys and priority_band MUST stay as English enum values
 * so backend template logic (filtering, counting) works correctly.
 * Only display labels are translated, not data keys.
 */

export interface PdfPayload {
  school: {
    school_code: string;
    school_name: string;
  };
  aggregates: any;
  competencies: any[];
  lang: 'en' | 'hi';
  reportType?: 'full' | 'grade';
  gradeLevel?: number;
}

/**
 * Pass-through function - no transformation needed
 * Backend handles all language mapping
 */
export function transformPdfPayload(payload: PdfPayload): PdfPayload {
  // Return payload as-is
  // Subject keys stay as "English", "Mathematics", etc.
  // priority_band stays as "High", "Medium", "Low"
  // competency_name stays in English
  // Backend template will handle display translation
  return payload;
}

