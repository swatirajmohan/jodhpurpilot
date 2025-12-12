# Jodhpur School Assessment Dashboard

A minimalist, colour coded web dashboard for a school assessment pilot conducted in Jodhpur.

## Project Structure

```
jodhpurpilot/
├── FRS.md                          # Functional Requirement Specification (single source of truth)
├── src/
│   ├── data/                       # JSON data files
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

2. Run development server:
```bash
npm run dev
```

3. Build for production:
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
- ⏳ Phase 2: Excel to JSON import script
- ⏳ Phase 3: Dashboard table with search, sort, pagination
- ⏳ Phase 4: Detailed report card view
- ⏳ Phase 5: PDF export
- ⏳ Phase 6: QA and validation

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6

