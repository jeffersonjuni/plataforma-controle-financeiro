import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { getAnnualReport } from "@/lib/services/reports/annualReport";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const accountIdParam = searchParams.get("accountId");

    const year = yearParam ? Number(yearParam) : new Date().getFullYear();
    const accountId = accountIdParam ? Number(accountIdParam) : undefined;

    const report = await getAnnualReport(decoded.userId, year, accountId);

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório anual" },
      { status: 500 }
    );
  }
}
