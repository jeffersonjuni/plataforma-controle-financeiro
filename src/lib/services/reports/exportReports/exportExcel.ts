import * as XLSX from "xlsx";

export function exportToExcel(data: any[], sheetName = "Relatorio"): Buffer {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}
