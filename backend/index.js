import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdf-backend' });
});

// PDF generation endpoint
app.post('/generate-pdf', async (req, res) => {
  let browser = null;
  
  try {
    console.log('📄 PDF generation request received');
    
    const { school, aggregates, competencies, lang } = req.body;
    
    if (!school || !lang) {
      return res.status(400).json({ error: 'Missing required fields: school, lang' });
    }
    
    // Load HTML template
    const templatePath = join(__dirname, 'templates', 'report.html');
    let html = readFileSync(templatePath, 'utf-8');
    
    // Replace template variables
    html = html
      .replace(/{{SCHOOL_NAME}}/g, school.school_name || 'N/A')
      .replace(/{{SCHOOL_CODE}}/g, school.school_code || 'N/A')
      .replace(/{{LANG}}/g, lang)
      .replace(/{{DATA_JSON}}/g, JSON.stringify({
        school,
        aggregates,
        competencies,
        lang
      }));
    
    console.log('🚀 Launching Puppeteer...');
    
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    console.log('📄 Generating PDF...');
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    browser = null;
    
    console.log('✅ PDF generated successfully');
    
    // Send PDF
    const filename = `${school.school_code}_${school.school_name.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ PDF Backend running on http://localhost:${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
});

