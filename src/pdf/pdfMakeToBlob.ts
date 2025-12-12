export async function pdfMakeToBlob(pdfMake: any, docDefinition: any, timeoutMs = 30000): Promise<Blob> {
  // Let browser breathe before PDF generation
  await new Promise(requestAnimationFrame);

  return await new Promise((resolve, reject) => {
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error(`PDF blob generation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);

      // Use getBuffer instead of getBlob for better performance
      pdfDoc.getBuffer((buffer: ArrayBuffer) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        
        // Convert buffer to blob
        const blob = new Blob([buffer], { type: "application/pdf" });
        resolve(blob);
      });
    } catch (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(e);
    }
  });
}

