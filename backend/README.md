# PDF Backend Service

Minimal Node.js backend using Puppeteer for PDF generation.

## Features

- ✅ Express server on port 3001
- ✅ Puppeteer for PDF generation
- ✅ Hindi + English support
- ✅ No database, no auth
- ✅ Single endpoint: POST /generate-pdf

## Installation

```bash
cd backend
npm install
```

## Start Server

```bash
npm start
```

Server will run on: http://localhost:3001

## Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "pdf-backend"
}
```

### Generate PDF

```
POST /generate-pdf
Content-Type: application/json
```

Request body:
```json
{
  "school": {
    "school_code": "220371",
    "school_name": "School Name"
  },
  "aggregates": {
    "overall_avg": 7.5,
    "subject_avg_map": {
      "English": 7.2,
      "Mathematics": 7.8,
      "Science": 7.3,
      "Social Science": 7.6
    }
  },
  "competencies": [
    {
      "grade_level": 6,
      "subject": "English",
      "competency_name": "Reading Comprehension",
      "score_10": 7.5,
      "priority_band": "Medium"
    }
  ],
  "lang": "en"
}
```

Response:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="school_report.pdf"
- Binary PDF data

## How It Works

1. Frontend sends POST request with school data
2. Backend loads HTML template
3. Injects data into template
4. Puppeteer renders HTML to PDF
5. Returns PDF as download

## Template

HTML template location: `templates/report.html`

- Uses inline CSS
- Renders school info, averages, competencies
- Supports English and Hindi via JavaScript
- A4 portrait format

## Development

The backend is separate from the frontend and can run independently.

Frontend URL: http://localhost:5173
Backend URL: http://localhost:3001

Frontend makes fetch() calls to backend to generate PDFs.

