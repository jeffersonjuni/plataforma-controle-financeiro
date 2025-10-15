import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { getAnnualReport } from "@/lib/services/reports/annualReport";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Token ausente" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    
    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const report = await getAnnualReport(decoded.userId, year);

    return NextResponse.json(report);
  } catch (err: any) {
    console.error("Erro ao gerar annualReport:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
