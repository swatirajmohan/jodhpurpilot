export function sanitiseDocDefinition(obj: any): any {
  if (obj === undefined || obj === null) return "";
  if (typeof obj === "number") {
    if (Number.isNaN(obj) || !Number.isFinite(obj)) return "";
    return obj;
  }
  if (typeof obj === "string") return obj;
  if (typeof obj === "boolean") return obj ? "true" : "false";

  if (Array.isArray(obj)) return obj.map(sanitiseDocDefinition);

  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      // drop undefined entirely
      if (v === undefined) continue;

      // pdfmake expects text values as string or array, so force any text key to string
      if (k === "text") {
        out[k] = typeof v === "string" ? v : String(v ?? "");
        continue;
      }

      out[k] = sanitiseDocDefinition(v);
    }
    return out;
  }

  return String(obj);
}

