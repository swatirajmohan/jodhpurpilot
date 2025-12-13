import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("PDF TIMEOUT");
      res.status(500).json({ error: "PDF generation timeout" });
    }
  }, 30000); // 30 second timeout

  try {
    console.log("PDF REQUEST RECEIVED");
    const { school, lang } = req.body;
    
    if (!school || !school.school_code) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Missing school data" });
    }

    console.log(`Generating PDF for ${school.school_code} (${lang || 'en'})`);

    // Generate hardcoded PDF (replace with real Puppeteer later)
    const pdfBuffer = Buffer.from(
      "%PDF-1.4\n" +
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n" +
      "4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 72 Td (PDF: " + school.school_code + ") Tj ET\nendstream\nendobj\n" +
      "xref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000111 00000 n \n0000000200 00000 n \n" +
      "trailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n290\n%%EOF"
    );

    clearTimeout(timeout);

    // Proper download headers
    const filename = `${school.school_code}_${lang || 'en'}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    
    // Send buffer (not stream)
    res.send(pdfBuffer);
    
    console.log(`PDF sent: ${filename}`);
  } catch (error) {
    clearTimeout(timeout);
    console.error("PDF ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(3001, () => {
  console.log("PDF PROOF BACKEND RUNNING ON http://localhost:3001");
});
