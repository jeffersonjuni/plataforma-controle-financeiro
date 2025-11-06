import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/authService";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId");
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));

    if (!accountId)
      return NextResponse.json({ error: "accountId é obrigatório" }, { status: 400 });

    const whereClause: any = {
      accountId: Number(accountId),
      account: { userId: decoded.userId },
    };

    if (month && year) {
      whereClause.date = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    const transactions = await prisma.transaction.findMany({ where: whereClause });

    const entrada = transactions
      .filter((t) => t.type === "ENTRADA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saida = transactions
      .filter((t) => t.type === "SAIDA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saldoTotal = entrada - saida;

    return NextResponse.json({ entrada, saida, saldoTotal });
  } catch (error: any) {
    console.error("Erro em /api/transactions/summary:", error);
    return NextResponse.json({ error: "Erro ao buscar resumo de transações" }, { status: 500 });
  }
}
