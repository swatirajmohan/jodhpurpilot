export async function pdfMakeToBlob(pdfMake: any, docDefinition: any, timeoutMs = 30000): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error(`PDF blob generation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);

      // pdfmake uses callback style
      pdfDoc.getBlob((blob: Blob) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
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

