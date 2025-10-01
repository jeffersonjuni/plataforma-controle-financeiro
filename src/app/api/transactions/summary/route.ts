import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/authService";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Busca todas as transações do usuário
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId: decoded.userId,
        },
      },
    });

    // Calcula entradas, saídas e saldo total
    const entrada = transactions
      .filter((t) => t.type === "ENTRADA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saida = transactions
      .filter((t) => t.type === "SAIDA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saldoTotal = entrada - saida;

    return NextResponse.json({
      saldoTotal,
      entrada,
      saida,
    });
  } catch (error: any) {
    console.error("Erro em /api/transactions/summary:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resumo de transações" },
      { status: 500 }
    );
  }
}
