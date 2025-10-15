import { NextResponse } from "next/server";
import { getMonthlyReport } from "@/lib/services/reports/monthlyReport";

export async function GET() {
  const report = await getMonthlyReport(1, 9, 2025); 
  return NextResponse.json(report);
}
