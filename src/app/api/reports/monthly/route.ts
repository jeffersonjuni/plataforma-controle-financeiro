import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  const month = monthParam ? Number(monthParam) : new Date().getMonth() + 1;
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  });

  const monthlyReport = transactions.reduce((acc, t) => {
    const monthName = new Date(t.date).toLocaleString("default", { month: "long" });
    if (!acc[monthName]) acc[monthName] = { income: 0, expense: 0, balance: 0 };

    if (t.type === "ENTRADA") acc[monthName].income += t.amount;
    else if (t.type === "SAIDA") acc[monthName].expense += t.amount;

    acc[monthName].balance = acc[monthName].income - acc[monthName].expense;
    return acc;
  }, {} as Record<string, { income: number; expense: number; balance: number }>);

  const formattedReport = Object.entries(monthlyReport).map(([month, values]) => ({
    month,
    ...values,
  }));

  return NextResponse.json(formattedReport);
}
