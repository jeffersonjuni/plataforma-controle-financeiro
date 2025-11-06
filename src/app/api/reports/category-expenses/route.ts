import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { getCategoryReport } from "@/lib/services/reports/categoryReport";

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

    const url = new URL(req.url);
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));
    const accountIdParam = url.searchParams.get("accountId");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      );
    }

    const accountId = accountIdParam ? Number(accountIdParam) : undefined;

    const data = await getCategoryReport(decoded.userId, month, year, accountId);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro category-expenses:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
