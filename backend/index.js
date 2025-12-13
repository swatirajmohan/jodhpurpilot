import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-pdf", (req, res) => {
  console.log("PDF REQUEST RECEIVED");
  console.log("REQUEST BODY:", JSON.stringify(req.body, null, 2));

  const pdfBuffer = Buffer.from(
    "%PDF-1.4\n" +
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n" +
    "4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 72 Td (PDF GENERATED SUCCESSFULLY) Tj ET\nendstream\nendobj\n" +
    "xref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000111 00000 n \n0000000200 00000 n \n" +
    "trailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n290\n%%EOF"
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=proof.pdf");
  res.send(pdfBuffer);
});

app.listen(3001, () => {
  console.log("PDF PROOF BACKEND RUNNING ON http://localhost:3001");
});
