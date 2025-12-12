# Data Input Folder

This folder contains the raw Excel file(s) used for data import.

## Required File

Place the Excel file here with this exact name:

```
Schoolwise_Skill_Scores.xlsx
```

## File Format Requirements

The Excel file must contain the following columns:

### Required Columns

1. **SchoolName** (or "School Name")
   - Format: `SCHOOL NAME (SCHOOL_CODE)`
   - Example: `Government School Jodhpur (12345)`

2. **Grade** (or "Grade Level")
   - Values: 6, 7, or 8
   - Other grades will be filtered out

3. **Subject** (or "SubjectName")
   - Valid values: English, Math, Science, SST
   - Other subjects will be filtered out

4. **SkillName** (or "Competency Name")
   - The name of the competency/skill being assessed

5. **10 Point Score** (or "10-Point Score" or "10Point Score")
   - Numeric value between 0-10
   - **This is the ONLY score column used** (percentages are ignored)

## Import Process

Once the Excel file is placed here, run:

```bash
npm run import-data
```

This will:
1. Read the Excel file
2. Parse and filter data according to FRS.md specifications
3. Generate three JSON files in `/src/data/`:
   - `schools.json` - List of unique schools
   - `score_rows.json` - All competency scores
   - `aggregates.json` - Pre-computed averages

## Data Transformations

The import script applies these transformations:

- **School Name Parsing**: Extracts school name and code from brackets
- **Grade Filtering**: Keeps only grades 6, 7, 8
- **Subject Filtering**: Keeps only English, Math, Science, SST
- **Priority Band Calculation**:
  - Score 0-4 → High (Below expected)
  - Score 5-6 → Medium (At expected)
  - Score 7-10 → Low (Above expected)
- **Aggregation**: Computes overall, subject, grade, and grade-subject averages

## Notes

- The Excel file itself is not committed to git (see `.gitignore`)
- The script can be run multiple times safely
- Invalid rows are skipped with a count shown in the output

