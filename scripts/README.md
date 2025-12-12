# Scripts Folder

This folder contains data processing and utility scripts for the Jodhpur School Assessment Dashboard.

## Available Scripts

### `import_xlsx_to_json.js`

Data import script that transforms Excel data into structured JSON files.

**Purpose**: Convert raw Excel assessment data into the three core JSON files used by the React application.

**Usage**:
```bash
npm run import-data
```

**Prerequisites**:
1. Place the Excel file at `/data_input/Schoolwise_Skill_Scores.xlsx`
2. Ensure the Excel file has the required columns (see `/data_input/README.md`)

**What it does**:

1. **Reads** the Excel file from `/data_input/`
2. **Parses** school names to extract school code and name
3. **Filters** data to keep only:
   - Grades: 6, 7, 8
   - Subjects: English, Math, Science, SST
4. **Calculates** priority bands based on 10-point scores
5. **Generates** three JSON files in `/src/data/`:
   - `schools.json` - Unique schools list
   - `score_rows.json` - All competency scores
   - `aggregates.json` - Pre-computed averages

**Output Example**:

```
📊 Starting data import from Excel...

📖 Reading Excel file: /path/to/data_input/Schoolwise_Skill_Scores.xlsx
✓ Read 1500 rows from Excel

🔄 Processing rows...
✓ Processed 1200 valid rows
✓ Skipped 300 rows (invalid grade/subject/school)

📝 Generating schools.json...
✓ Created /path/to/src/data/schools.json with 25 schools

📝 Generating score_rows.json...
✓ Created /path/to/src/data/score_rows.json with 1200 score rows

📝 Generating aggregates.json...
✓ Created /path/to/src/data/aggregates.json with 25 school aggregates

✅ Data import complete!
```

**Safe to Rerun**: Yes, the script can be run multiple times. It will overwrite the JSON files each time.

**Error Handling**:
- If Excel file is missing, script exits with clear error message
- Invalid rows are skipped and counted
- Missing data is handled gracefully (null values for missing averages)

## Data Transformations

All transformations follow the specifications in `FRS.md`:

### School Name Parsing
- Input: `"Government School (12345)"`
- Extracts:
  - `school_name`: `"Government School"`
  - `school_code`: `"12345"` (pure number string, no brackets)

### Priority Band Calculation
Based on 10-point score:
- **0-4**: High (Below expected)
- **5-6**: Medium (At expected)
- **7-10**: Low (Above expected)

### Aggregation Logic
- **Overall Average**: Mean of all 10-point scores across all grades and subjects
- **Subject Averages**: Mean per subject (English, Math, Science, SST) across grades 6-8
- **Grade Averages**: Mean per grade (6, 7, 8) across all subjects
- **Grade-Subject Averages**: Mean per grade per subject combination

## Development Notes

- Uses ES modules (`import`/`export`)
- Requires Node.js with ES module support
- Dependencies: `xlsx` for Excel parsing
- All file operations use absolute paths for reliability

