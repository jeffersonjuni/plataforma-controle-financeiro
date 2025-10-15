import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { getMonthlyReport } from "@/lib/services/reports/monthlyReport";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const month = monthParam ? Number(monthParam) : new Date().getMonth() + 1;
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const report = await getMonthlyReport(decoded.userId, month, year);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Erro ao gerar relatório mensal:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o relatório mensal" },
      { status: 500 }
    );
  }
}
