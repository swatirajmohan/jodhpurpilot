
# Functional Requirement Specification (FRS)
## Jodhpur School Assessment Dashboard

---

## 1. Objective

Build a minimalist, colour coded web dashboard for a school assessment pilot conducted in Jodhpur.  
The system must allow users to view school level performance, drill down into detailed report cards, and download a consolidated PDF report per school.

All calculations must strictly use **10 point scores only**.

---

## 2. Scope

### In scope
- School level dashboard with aggregated scores
- Subject wise and grade wise breakdown
- Competency level report card view
- One PDF download per school containing all grades and subjects

### Out of scope
- User authentication
- Data editing or uploads through UI
- Charts or visualisations beyond tables and colour indicators

---

## 3. Data Source and Constraints

### 3.1 Source files
- Excel file: `Schoolwise_Skill_Scores`
- PDF reference: Teacher School Report Card format

### 3.2 Tool constraint
Cursor AI does not support Excel or PDF uploads.  
Therefore, all raw files must be converted into structured JSON files and committed to the repository.

---

## 4. Business Rules

### 4.1 School name and code
- `SchoolName` field format: `SCHOOL NAME (SCHOOL_CODE)`
- Extract:
  - `school_name` = text before brackets
  - `school_code` = digits inside brackets
- Display and store **school_code as pure number string only**, without brackets

### 4.2 Grades and subjects
- Grades to include: 6, 7, 8 only
- Subjects to include:
  - English
  - Math
  - Science
  - SST

### 4.3 Score usage
- Use **only the 10 Point Score column**
- Ignore percentage or any other score fields

### 4.4 Priority bands
Derived from the report card definition:

| Score range | Priority band | Meaning |
|------------|---------------|---------|
| 0 to 4 | High | Below expected |
| 5 to 6 | Medium | At expected |
| 7 to 10 | Low | Above expected |

---

## 5. Functional Requirements

### 5.1 Dashboard view

#### 5.1.1 Table columns
Each row represents one school.

Columns:
1. School Name
2. School Code
3. Overall Average (Grades 6–8, all subjects)
4. English Average
5. Math Average
6. SST Average
7. Science Average
8. View detailed report
9. Download detailed report (PDF)

#### 5.1.2 Aggregation logic
- Overall Average = mean of all 10 point scores across Grades 6, 7, 8 and all four subjects
- Subject Average = mean of all 10 point scores for that subject across Grades 6, 7, 8
- Missing data:
  - If partial data exists, calculate using available rows
  - If no data exists, display "No data"

#### 5.1.3 Interactions
- Search by School Name or School Code
- Sort by Overall or Subject averages
- Double click on "View detailed report" opens the school report card
- Colour coded score indicators based on priority bands

---

### 5.2 Detailed report view (School report card)

#### 5.2.1 Structure
- Header:
  - School Name
  - School Code
  - District, Block (if available)
- Grade tabs:
  - Grade 6
  - Grade 7
  - Grade 8
- Subject tabs inside each grade:
  - English
  - Math
  - Science
  - SST

#### 5.2.2 Competency table
For each subject:

Columns:
1. Competency name (SkillName)
2. 10 point score
3. Priority band

Sorting:
- High priority first
- Then medium
- Then low
- Within each band, sort by score ascending

---

### 5.3 PDF download

#### 5.3.1 Scope
- One PDF per school
- Includes:
  - Grades 6, 7, 8
  - All four subjects per grade
  - All competencies with scores and priority bands

#### 5.3.2 Layout rules
- Each grade starts on a new page
- Subjects grouped within each grade
- Priority colours consistent with UI
- File name format:
  `{school_code}_{school_name}_report.pdf`

#### 5.3.3 Implementation requirement
- Use a print friendly version of the report card component
- PDF generation must render all grades and subjects in one flow, not tab based

---

## 6. Data Model

### 6.1 Canonical entities

#### School
- school_code
- school_name

#### ScoreRow
- school_code
- grade_level
- subject
- competency_name
- score_10
- priority_band

#### Aggregates
- overall_avg
- subject_avg_map
- grade_avg_map
- grade_subject_avg_map

---

## 7. Data Processing Pipeline

### 7.1 Import workflow

1. Store raw Excel file in `data_input/`
2. Run import script:
   `scripts/import_xlsx_to_json`
3. Generate:
   - `schools.json`
   - `score_rows.json`
   - `aggregates.json`

### 7.2 Import rules
- Filter grades to 6, 7, 8
- Filter subjects to English, Math, Science, SST
- Compute priority band at import time
- Persist clean JSON for Cursor friendly development

---

## 8. Technical Architecture

### 8.1 Routes
- `/` : Dashboard
- `/school/:school_code` : Detailed report view

### 8.2 Components
- DashboardTable
- ScoreChip
- SchoolReportCard
- GradeTabs
- SubjectTabs
- PdfExportButton

---

## 9. Build Plan

### Phase 1
- Repo setup
- Routing
- Static JSON loading

### Phase 2
- Excel to JSON import script
- Data validation

### Phase 3
- Dashboard table
- Search, sort, pagination

### Phase 4
- Detailed report card view

### Phase 5
- PDF export

### Phase 6
- QA and validation

---

## 10. Acceptance Criteria

- Dashboard shows correct averages using 10 point scores only
- School Code displayed as pure number string
- Double click opens detailed report
- PDF download produces one file per school with all grades and subjects
- Priority bands consistent across UI and PDF

---

