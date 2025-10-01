import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));

    if (!month || !year) {
      return NextResponse.json({ error: "Mês e ano são obrigatórios" }, { status: 400 });
    }

    // Ajuste de datas para o Prisma
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Buscar transações do mês/ano filtrando por despesas
    const transactions = await prisma.transaction.findMany({
      where: {
        type: "SAIDA",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    // Agrupar despesas por categoria
    const grouped: Record<string, number> = {};
    transactions.forEach((t) => {
      const cat = t.category || "OUTROS";
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += t.amount;
    });

    // Transformar em array para Recharts
    const data = Object.entries(grouped).map(([category, amount]) => ({
      category,
      amount,
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro category-expenses:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
