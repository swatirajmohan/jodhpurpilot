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

  // Strict preflight validation
  function assert(condition: any, msg: string) {
    if (!condition) throw new Error(msg);
  }

  assert(pdfMake.vfs, "pdfMake.vfs is missing");
  assert(Object.keys(pdfMake.vfs).length > 0, "pdfMake.vfs is empty");

  assert(pdfMake.vfs["Roboto-Regular.ttf"], "Missing Roboto-Regular.ttf in vfs");
  assert(pdfMake.vfs["NotoSansDevanagari-Regular.ttf"], "Missing NotoSansDevanagari-Regular.ttf in vfs");

  assert(pdfMake.fonts?.Roboto?.normal === "Roboto-Regular.ttf", "Roboto font mapping wrong");
  assert(pdfMake.fonts?.NotoSansDevanagari?.normal === "NotoSansDevanagari-Regular.ttf", "Hindi font mapping wrong");

  return pdfMake;
}
