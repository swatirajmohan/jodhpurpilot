import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hindi competency translation map
const COMPETENCY_HI_MAP = {
  "Vocabulary": "शब्दावली",
  "Reading Comprehension": "पठन बोध",
  "Understanding Stories and Poems": "कहानियों और कविताओं की समझ",
  "Writing Clear and Organized Ideas": "स्पष्ट और व्यवस्थित लेखन",
  "Building Correct Sentences and Using Proper Grammar": "सही वाक्य निर्माण और व्याकरण का सही प्रयोग",
  "Lines and Angles": "रेखाएँ और कोण",
  "Perimeter and Area": "परिमाप और क्षेत्रफल",
  "Solving Problems with Numbers": "संख्याओं से समस्याएँ हल करना",
  "Understanding Shapes and Measurement": "आकृतियों और मापन की समझ",
  "Understanding and Using Number Properties": "संख्या गुणधर्मों की समझ और उपयोग",
  "Understanding and Ordering Numbers": "संख्याओं की समझ और क्रमबद्ध करना",
  "Representing and Interpreting Data": "डेटा का प्रतिनिधित्व और व्याख्या",
  "Solving Problems with Algebra (Unknowns)": "बीजगणित से समस्याएँ हल करना",
  "Working with Fractions and Decimals": "भिन्न और दशमलव के साथ काम करना",
  "Applying Science to Everyday Life": "रोजमर्रा की जिंदगी में विज्ञान का प्रयोग",
  "Making Healthy Food Choices and Identifying Food Components": "स्वस्थ भोजन विकल्प और खाद्य घटकों की पहचान",
  "Understanding Living Organisms and Life Processes": "जीवित जीवों और जीवन प्रक्रियाओं की समझ",
  "Understanding Properties and Changes of Materials": "पदार्थों के गुण और परिवर्तन की समझ",
  "Understanding how magnets work": "चुंबक कैसे काम करते हैं",
  "Ensuring Healthy Plant Growth and Food Safety": "स्वस्थ पौधों की वृद्धि और खाद्य सुरक्षा",
  "Measuring Physical Properties": "भौतिक गुणों को मापना",
  "Understanding Heat and Its Transfer": "गर्मी और इसके स्थानांतरण की समझ",
  "Understanding how materials and weather affect us": "पदार्थ और मौसम हमें कैसे प्रभावित करते हैं",
  "Appreciating India's Cultural and Historical Heritage": "भारत की सांस्कृतिक और ऐतिहासिक विरासत की सराहना",
  "Appreciating Rajasthan's Culture and History": "राजस्थान की संस्कृति और इतिहास की सराहना",
  "Exploring Historical Places and Events": "ऐतिहासिक स्थानों और घटनाओं की खोज",
  "Understanding Community Rules and Rights": "समुदाय के नियम और अधिकार की समझ",
  "Understanding Early Civilizations": "प्रारंभिक सभ्यताओं की समझ",
  "Understanding Natural Environment & Resources": "प्राकृतिक पर्यावरण और संसाधनों की समझ",
  "Analyzing Social Change & Justice": "सामाजिक परिवर्तन और न्याय का विश्लेषण",
  "Exploring Livelihoods in Our Region": "हमारे क्षेत्र में आजीविका की खोज",
  "Understanding Constitutional Rights & Duties": "संवैधानिक अधिकार और कर्तव्यों की समझ",
  "Understanding Economic Development": "आर्थिक विकास की समझ",
  "Understanding Local governance": "स्थानीय शासन की समझ"
};

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

    // STEP 3: Translate competency names for Hindi
    if (lang === "hi" && Array.isArray(competencies)) {
      competencies.forEach(c => {
        c.competency_name =
          COMPETENCY_HI_MAP[c.competency_name] ?? c.competency_name;
      });
    }

    console.log("BACKEND_COMP_SAMPLE", lang, competencies[0]?.competency_name);
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
