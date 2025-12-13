/**
 * Bulk PDF Download as ZIP
 * Downloads all school PDFs from backend and packages as one ZIP file
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generatePdfFromBackend } from './pdfBackend';
import schoolsData from '../data/schools.json';
import aggregatesData from '../data/aggregates.json';
import scoreRowsData from '../data/score_rows.json';

interface School {
  school_code: string;
  school_name: string;
}

interface Aggregates {
  school_code: string;
  overall_avg: number | null;
  subject_avg_map: {
    English: number | null;
    Mathematics: number | null;
    Science: number | null;
    'Social Science': number | null;
  };
}

export interface DownloadAllProgress {
  current: number;
  total: number;
  failures: string[];
}

/**
 * Download all school PDFs as a single ZIP file
 */
export async function downloadAllPdfsAsZip(
  lang: 'en' | 'hi',
  onProgress?: (progress: DownloadAllProgress) => void
): Promise<void> {
  const schools = schoolsData as School[];
  const allAggregates = aggregatesData as Aggregates[];
  const allScoreRows = scoreRowsData as any[];
  
  const zip = new JSZip();
  const failures: string[] = [];
  
  console.log(`Starting bulk download: ${schools.length} schools`);
  
  // Process schools sequentially
  for (let i = 0; i < schools.length; i++) {
    const school = schools[i];
    
    try {
      // Update progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: schools.length,
          failures: [...failures]
        });
      }
      
      console.log(`[${i + 1}/${schools.length}] Generating PDF for ${school.school_code}`);
      
      // Get school data
      const schoolAggregates = allAggregates.find(a => a.school_code === school.school_code);
      const competencies = allScoreRows.filter((row: any) => row.school_code === school.school_code);
      
      // Call backend to generate PDF
      const blob = await generatePdfFromBackend({
        school: {
          school_code: school.school_code,
          school_name: school.school_name
        },
        aggregates: schoolAggregates,
        competencies,
        lang
      });
      
      // Add to ZIP
      const filename = `${school.school_code}_${lang}.pdf`;
      zip.file(filename, blob);
      
      console.log(`✓ Added ${filename} to ZIP`);
      
    } catch (error) {
      console.error(`✗ Failed for ${school.school_code}:`, error);
      failures.push(`${school.school_code} (${school.school_name})`);
    }
  }
  
  // Generate ZIP
  console.log('Generating ZIP file...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Download ZIP
  const zipFilename = `jodhpur_school_pdfs_${lang}.zip`;
  saveAs(zipBlob, zipFilename);
  
  console.log(`✓ ZIP downloaded: ${zipFilename}`);
  
  // Final progress update
  if (onProgress) {
    onProgress({
      current: schools.length,
      total: schools.length,
      failures
    });
  }
  
  // Show summary
  if (failures.length > 0) {
    alert(
      `Downloaded ${schools.length - failures.length} of ${schools.length} PDFs.\n\n` +
      `Failed (${failures.length}):\n${failures.join('\n')}`
    );
  } else {
    alert(`Successfully downloaded all ${schools.length} school PDFs in ZIP file!`);
  }
}

