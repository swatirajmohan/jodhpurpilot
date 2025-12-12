import { customVfs } from "./customVfs";

export async function loadPdfMake() {
  const pdfMakeModule: any = await import("pdfmake/build/pdfmake");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;

  if (!pdfMake) throw new Error("pdfMake failed to load");

  // Inject VFS (fonts)
  pdfMake.vfs = customVfs;

  // Register font names
  pdfMake.fonts = {
    Roboto: { normal: "Roboto-Regular.ttf" },
    NotoSansDevanagari: { normal: "NotoSansDevanagari-Regular.ttf" }
  };

  return pdfMake;
}
