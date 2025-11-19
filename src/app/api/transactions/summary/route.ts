import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // --- Autenticação ---
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    // --- Query params ---
    const url = new URL(req.url);
    const accountIdParam = url.searchParams.get("accountId");
    const monthParam = url.searchParams.get("month");
    const yearParam = url.searchParams.get("year");

    if (!accountIdParam)
      return NextResponse.json({ error: "accountId é obrigatório" }, { status: 400 });

    const accountId = Number(accountIdParam);

    // --- Validações ---
    if (isNaN(accountId))
      return NextResponse.json({ error: "accountId inválido" }, { status: 400 });

    // Validar month/year apenas se vierem
    let dateFilter = {};
    if (monthParam !== null && yearParam !== null) {
      const month = Number(monthParam);
      const year = Number(yearParam);

      if (
        isNaN(month) ||
        isNaN(year) ||
        month < 1 ||
        month > 12 ||
        year < 1900
      ) {
        return NextResponse.json({ error: "Mês ou ano inválidos" }, { status: 400 });
      }

      dateFilter = {
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      };
    }

    // --- Verifica se a conta realmente pertence ao usuário ---
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: decoded.userId },
    });

    if (!account)
      return NextResponse.json(
        { error: "Conta não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );

    // --- Buscar transações ---
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId,
        ...dateFilter,
      },
    });

    // --- Cálculo ---
    const entrada = transactions
      .filter((t) => t.type === "ENTRADA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saida = transactions
      .filter((t) => t.type === "SAIDA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saldoTotal = entrada - saida;

    return NextResponse.json({
      entrada,
      saida,
      saldoTotal,
      totalTransacoes: transactions.length,
    });
  } catch (error: any) {
    console.error("Erro em /api/transactions/summary:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resumo de transações" },
      { status: 500 }
    );
  }
}
