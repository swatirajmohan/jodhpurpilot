// src/pdf/loadPdfMake.ts

export async function loadPdfMake() {
  // pdfmake exports can differ by bundler, so resolve defensively
  const pdfMakeModule: any = await import("pdfmake/build/pdfmake");
  const vfsModule: any = await import("pdfmake/build/vfs_fonts");

  const pdfMake = pdfMakeModule?.default ?? pdfMakeModule;

  // vfs can be at vfsModule.pdfMake.vfs OR vfsModule.default.pdfMake.vfs OR vfsModule.vfs
  const vfs =
    vfsModule?.pdfMake?.vfs ??
    vfsModule?.default?.pdfMake?.vfs ??
    vfsModule?.vfs;

  if (!pdfMake) throw new Error("pdfMake import failed");
  if (!vfs) throw new Error("vfs_fonts import failed: vfs not found");

  pdfMake.vfs = vfs;

  // sanity check
  if (!pdfMake?.createPdf) throw new Error("pdfMake.createPdf missing after import");

  return pdfMake;
}

export async function debugPdfMakeImports() {
  const pdfMakeModule: any = await import("pdfmake/build/pdfmake");
  const vfsModule: any = await import("pdfmake/build/vfs_fonts");
  console.log("pdfMakeModule keys", Object.keys(pdfMakeModule || {}));
  console.log("vfsModule keys", Object.keys(vfsModule || {}));
  console.log("vfsModule.pdfMake keys", Object.keys(vfsModule?.pdfMake || {}));
  console.log("vfsModule.default keys", Object.keys(vfsModule?.default || {}));
}

