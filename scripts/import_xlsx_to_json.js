/**
 * Data Import Script: Excel to JSON
 * 
 * This script transforms raw Excel data into structured JSON files
 * following the FRS.md specifications strictly.
 * 
 * Input: /data_input/Schoolwise_Skill_Scores.xlsx
 * Output: Three JSON files in /src/data/
 *   - schools.json
 *   - score_rows.json
 *   - aggregates.json
 * 
 * Usage: npm run import-data
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const INPUT_FILE = path.join(__dirname, '../data_input/Schoolwise_Skill_Scores.xlsx');
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const SCHOOLS_OUTPUT = path.join(OUTPUT_DIR, 'schools.json');
const SCORE_ROWS_OUTPUT = path.join(OUTPUT_DIR, 'score_rows.json');
const AGGREGATES_OUTPUT = path.join(OUTPUT_DIR, 'aggregates.json');

// Constants from FRS.md
const VALID_GRADES = [6, 7, 8];
const VALID_SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science'];

/**
 * Parse school name to extract school_name and school_code
 * Format: "SCHOOL NAME (SCHOOL_CODE)"
 * 
 * @param {string} schoolNameRaw - Raw school name from Excel
 * @returns {object} { school_name, school_code }
 */
function parseSchoolName(schoolNameRaw) {
  if (!schoolNameRaw || typeof schoolNameRaw !== 'string') {
    return { school_name: '', school_code: '' };
  }

  // Extract school_name: text before brackets
  const nameMatch = schoolNameRaw.match(/^(.+?)\s*\(/);
  const school_name = nameMatch ? nameMatch[1].trim() : schoolNameRaw.trim();

  // Extract school_code: digits inside brackets (store as pure number string)
  const codeMatch = schoolNameRaw.match(/\((\d+)\)/);
  const school_code = codeMatch ? codeMatch[1] : '';

  return { school_name, school_code };
}

/**
 * Calculate priority band from 10-point score
 * FRS.md Section 4.4:
 * - 0–4: High (Below expected)
 * - 5–6: Medium (At expected)
 * - 7–10: Low (Above expected)
 * 
 * @param {number} score - 10-point score
 * @returns {string} Priority band: 'High', 'Medium', or 'Low'
 */
function calculatePriorityBand(score) {
  if (score >= 0 && score <= 4) return 'High';
  if (score >= 5 && score <= 6) return 'Medium';
  if (score >= 7 && score <= 10) return 'Low';
  return 'High'; // Default for invalid scores
}

/**
 * Calculate mean of an array of numbers
 * Handles missing data by averaging only available values
 * 
 * @param {number[]} values - Array of numeric values
 * @returns {number|null} Mean value or null if no valid data
 */
function calculateMean(values) {
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return null;
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
}

/**
 * Main import function
 */
function importData() {
  console.log('📊 Starting data import from Excel...\n');

  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Error: Input file not found at ${INPUT_FILE}`);
    console.error('Please place the Excel file at /data_input/Schoolwise_Skill_Scores.xlsx');
    process.exit(1);
  }

  // Read Excel file
  console.log(`📖 Reading Excel file: ${INPUT_FILE}`);
  const workbook = XLSX.readFile(INPUT_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  console.log(`✓ Read ${rawData.length} rows from Excel\n`);

  // Data structures
  const schoolsMap = new Map(); // school_code -> school object
  const scoreRows = [];
  const aggregatesMap = new Map(); // school_code -> scores array

  // Process each row
  console.log('🔄 Processing rows...');
  let processedCount = 0;
  let skippedCount = 0;

  rawData.forEach((row, index) => {
    // Extract and parse school name
    const { school_name, school_code } = parseSchoolName(row.SchoolName || row['School Name']);
    
    if (!school_code) {
      skippedCount++;
      return; // Skip rows without valid school code
    }

    // Store unique school
    if (!schoolsMap.has(school_code)) {
      schoolsMap.set(school_code, {
        school_code,
        school_name
      });
    }

    // Extract grade level
    const grade_level = parseInt(row.Grade || row['Grade Level'] || row.AsmtGradeLevel);
    
    // Filter: Keep only grades 6, 7, 8 (FRS.md Section 4.2)
    if (!VALID_GRADES.includes(grade_level)) {
      skippedCount++;
      return;
    }

    // Extract subject
    const subject = row.Subject || row.SubjectName || row.AsmtSubject;
    
    // Filter: Keep only English, Math, Science, SST (FRS.md Section 4.2)
    if (!VALID_SUBJECTS.includes(subject)) {
      skippedCount++;
      return;
    }

    // Extract competency name
    const competency_name = row.SkillName || row['Competency Name'] || row.Competency || '';

    // Extract 10-point score (FRS.md Section 4.3: Use ONLY 10 Point Score)
    const score_10 = parseFloat(row['10 Point Score'] || row['10-Point Score'] || row['10Point Score'] || 0);

    // Calculate priority band (FRS.md Section 4.4)
    const priority_band = calculatePriorityBand(score_10);

    // Create score row entry
    const scoreRow = {
      school_code,
      grade_level,
      subject,
      competency_name,
      score_10,
      priority_band
    };

    scoreRows.push(scoreRow);
    processedCount++;

    // Collect scores for aggregation
    if (!aggregatesMap.has(school_code)) {
      aggregatesMap.set(school_code, []);
    }
    aggregatesMap.get(school_code).push(scoreRow);
  });

  console.log(`✓ Processed ${processedCount} valid rows`);
  console.log(`✓ Skipped ${skippedCount} rows (invalid grade/subject/school)\n`);

  // Generate schools.json
  console.log('📝 Generating schools.json...');
  const schools = Array.from(schoolsMap.values());
  fs.writeFileSync(SCHOOLS_OUTPUT, JSON.stringify(schools, null, 2));
  console.log(`✓ Created ${SCHOOLS_OUTPUT} with ${schools.length} schools\n`);

  // Generate score_rows.json
  console.log('📝 Generating score_rows.json...');
  fs.writeFileSync(SCORE_ROWS_OUTPUT, JSON.stringify(scoreRows, null, 2));
  console.log(`✓ Created ${SCORE_ROWS_OUTPUT} with ${scoreRows.length} score rows\n`);

  // Generate aggregates.json
  console.log('📝 Generating aggregates.json...');
  const aggregates = [];

  aggregatesMap.forEach((scores, school_code) => {
    // Overall average: mean of all 10-point scores across grades 6-8 and all subjects
    const overall_avg = calculateMean(scores.map(s => s.score_10));

    // Subject averages: mean of 10-point scores per subject across grades 6-8
    const subject_avg_map = {
      English: calculateMean(scores.filter(s => s.subject === 'English').map(s => s.score_10)),
      Mathematics: calculateMean(scores.filter(s => s.subject === 'Mathematics').map(s => s.score_10)),
      Science: calculateMean(scores.filter(s => s.subject === 'Science').map(s => s.score_10)),
      'Social Science': calculateMean(scores.filter(s => s.subject === 'Social Science').map(s => s.score_10))
    };

    // Grade averages: mean of 10-point scores per grade across all subjects
    const grade_avg_map = {
      6: calculateMean(scores.filter(s => s.grade_level === 6).map(s => s.score_10)),
      7: calculateMean(scores.filter(s => s.grade_level === 7).map(s => s.score_10)),
      8: calculateMean(scores.filter(s => s.grade_level === 8).map(s => s.score_10))
    };

    // Grade-subject averages: mean of 10-point scores per grade per subject
    const grade_subject_avg_map = {
      6: {
        English: calculateMean(scores.filter(s => s.grade_level === 6 && s.subject === 'English').map(s => s.score_10)),
        Mathematics: calculateMean(scores.filter(s => s.grade_level === 6 && s.subject === 'Mathematics').map(s => s.score_10)),
        Science: calculateMean(scores.filter(s => s.grade_level === 6 && s.subject === 'Science').map(s => s.score_10)),
        'Social Science': calculateMean(scores.filter(s => s.grade_level === 6 && s.subject === 'Social Science').map(s => s.score_10))
      },
      7: {
        English: calculateMean(scores.filter(s => s.grade_level === 7 && s.subject === 'English').map(s => s.score_10)),
        Mathematics: calculateMean(scores.filter(s => s.grade_level === 7 && s.subject === 'Mathematics').map(s => s.score_10)),
        Science: calculateMean(scores.filter(s => s.grade_level === 7 && s.subject === 'Science').map(s => s.score_10)),
        'Social Science': calculateMean(scores.filter(s => s.grade_level === 7 && s.subject === 'Social Science').map(s => s.score_10))
      },
      8: {
        English: calculateMean(scores.filter(s => s.grade_level === 8 && s.subject === 'English').map(s => s.score_10)),
        Mathematics: calculateMean(scores.filter(s => s.grade_level === 8 && s.subject === 'Mathematics').map(s => s.score_10)),
        Science: calculateMean(scores.filter(s => s.grade_level === 8 && s.subject === 'Science').map(s => s.score_10)),
        'Social Science': calculateMean(scores.filter(s => s.grade_level === 8 && s.subject === 'Social Science').map(s => s.score_10))
      }
    };

    aggregates.push({
      school_code,
      overall_avg,
      subject_avg_map,
      grade_avg_map,
      grade_subject_avg_map
    });
  });

  fs.writeFileSync(AGGREGATES_OUTPUT, JSON.stringify(aggregates, null, 2));
  console.log(`✓ Created ${AGGREGATES_OUTPUT} with ${aggregates.length} school aggregates\n`);

  console.log('✅ Data import complete!\n');
  console.log('Generated files:');
  console.log(`  - ${SCHOOLS_OUTPUT}`);
  console.log(`  - ${SCORE_ROWS_OUTPUT}`);
  console.log(`  - ${AGGREGATES_OUTPUT}`);
}

// Run the import
try {
  importData();
} catch (error) {
  console.error('❌ Error during import:', error.message);
  process.exit(1);
}

