import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.post("/generate-pdf", async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("PDF TIMEOUT");
      res.status(500).json({ error: "PDF generation timeout" });
    }
  }, 30000); // 30 second timeout

  try {
    // STEP 1: Log request body
    console.log("PDF REQUEST RECEIVED");
    console.log("PDF BODY:", JSON.stringify(req.body, null, 2));

    // STEP 2: Validate required data
    const { school, aggregates, competencies, lang } = req.body;
    
    if (!school || !school.school_code) {
      clearTimeout(timeout);
      return res.status(400).json({ 
        error: "Missing school data", 
        body: req.body 
      });
    }

    if (!competencies || !Array.isArray(competencies)) {
      clearTimeout(timeout);
      return res.status(400).json({ 
        error: "Missing competencies array", 
        body: req.body 
      });
    }

    console.log(`Generating PDF for ${school.school_code} (${lang || 'en'})`);

    // STEP 5: Load and inject HTML template
    const templatePath = path.join(__dirname, "templates", "report.html");
    
    if (!fs.existsSync(templatePath)) {
      clearTimeout(timeout);
      return res.status(500).json({ error: "Template file not found" });
    }

    const html = fs.readFileSync(templatePath, "utf8");
    
    // Inject data into HTML
    const injectedHtml = html.replace(
      "</head>",
      `<script>window.__PDF_DATA__ = ${JSON.stringify(req.body)};</script></head>`
    );

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    
    // Set content with injected data
    await page.setContent(injectedHtml, { 
      waitUntil: "networkidle0",
      timeout: 20000 
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm"
      }
    });

    await browser.close();
    clearTimeout(timeout);

    // Send PDF
    const filename = `${school.school_code}_${lang || 'en'}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    
    res.send(pdfBuffer);
    
    console.log(`PDF sent: ${filename} (${pdfBuffer.length} bytes)`);
  } catch (error) {
    clearTimeout(timeout);
    console.error("PDF_RENDER_ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(3001, () => {
  console.log("PDF PROOF BACKEND RUNNING ON http://localhost:3001");
});
