# Jodhpur School Assessment Dashboard

A minimalist, colour coded web dashboard for a school assessment pilot conducted in Jodhpur.

## Project Structure

```
jodhpurpilot/
├── FRS.md                          # Functional Requirement Specification (single source of truth)
├── data_input/                     # Raw Excel files (not committed)
│   ├── README.md                   # Instructions for data input
│   └── Schoolwise_Skill_Scores.xlsx (place file here)
├── scripts/                        # Data processing scripts
│   ├── README.md                   # Script documentation
│   └── import_xlsx_to_json.js      # Excel to JSON import script
├── src/
│   ├── data/                       # Generated JSON data files
│   │   ├── schools.json
│   │   ├── score_rows.json
│   │   └── aggregates.json
│   ├── components/                 # React components
│   ├── pages/                      # Page components
│   │   ├── Dashboard.tsx
│   │   └── SchoolReport.tsx
│   ├── utils/                      # Utility functions
│   ├── styles/                     # CSS files
│   ├── types/                      # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx                     # Main app with routing
│   └── main.tsx                    # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Routes

- `/` - Dashboard view
- `/school/:school_code` - Detailed school report view

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Import data from Excel (optional - if you have the data file):
```bash
# Place Excel file at: data_input/Schoolwise_Skill_Scores.xlsx
npm run import-data
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Data Model

See `FRS.md` section 6 for complete data model specification.

### Key Entities

- **School**: school_code, school_name
- **ScoreRow**: school_code, grade_level, subject, competency_name, score_10, priority_band
- **Aggregates**: overall_avg, subject_avg_map, grade_avg_map, grade_subject_avg_map

## Development Phases

- ✅ Phase 1: Repo setup, routing, static JSON loading
- ✅ Phase 2: Excel to JSON import script
- ✅ Phase 3: Dashboard table with real data, search, and sorting
- ✅ Phase 4: Detailed report card view with competency-level breakdown
- ✅ Phase 5: PDF export with client-side generation
- ⏳ Phase 6: QA and validation

## Data Import Pipeline

The project includes a repeatable data import pipeline:

1. **Place Excel file**: Copy `Schoolwise_Skill_Scores.xlsx` to `/data_input/`
2. **Run import script**: `npm run import-data`
3. **Generated files**: Three JSON files created in `/src/data/`
   - `schools.json` - List of unique schools
   - `score_rows.json` - All competency scores with priority bands
   - `aggregates.json` - Pre-computed averages per school

The import script strictly follows FRS.md specifications:
- Parses school names to extract codes
- Filters for grades 6, 7, 8 only
- Filters for subjects: English, Math, Science, SST
- Uses only 10-point scores
- Calculates priority bands (High/Medium/Low)
- Computes all required aggregates

See `/scripts/README.md` and `/data_input/README.md` for detailed documentation.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6

