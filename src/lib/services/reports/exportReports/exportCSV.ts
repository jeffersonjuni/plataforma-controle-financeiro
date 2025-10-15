import { Parser } from "json2csv";

export function exportToCSV(data: any[], fields?: string[]): string {
  try {
    const opts = fields ? { fields } : {};
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    return csv;
  } catch (err) {
    console.error("Erro ao gerar CSV:", err);
    throw new Error("Erro ao gerar CSV");
  }
}
