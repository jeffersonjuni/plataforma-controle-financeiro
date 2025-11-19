import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/authService";
import { TransactionType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url, "http://localhost");

    const period = searchParams.get("period") ?? "monthly";
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));
    const accountIdParam = searchParams.get("accountId");
    const accountId = accountIdParam ? Number(accountIdParam) : undefined;

    // -----------------------------------------------------
    // PERIOD LOGIC
    // -----------------------------------------------------
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;

    const now = new Date();

    if (period === "weekly") {
      const current = new Date(year, month - 1, now.getDate());
      const first = current.getDate() - current.getDay();
      const last = first + 6;

      startDate = new Date(year, month - 1, first, 0, 0, 0);
      endDate = new Date(year, month - 1, last, 23, 59, 59);
    }

    if (period === "monthly") {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    }

    if (period === "yearly") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // -----------------------------------------------------
    // WHERE BASE
    // -----------------------------------------------------
    const baseWhere: any = {
      account: { userId: user.id },
      ...(accountId ? { accountId } : {}),
      ...(startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {}),
    };

    const transactions = await prisma.transaction.findMany({
      where: baseWhere,
      include: { account: true },
      orderBy: { date: "desc" },
    });

    // -----------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------
    const summary = transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.ENTRADA) acc.income += t.amount;
        if (t.type === TransactionType.SAIDA) acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );

    summary.balance = summary.income - summary.expense;

    // -----------------------------------------------------
    // MONTHLY DATA (gráficos)
    // -----------------------------------------------------
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    transactions.forEach((t) => {
      if (!t.date) return; // ← ❗ FIX do erro "t.date é possivelmente null"

      const monthIndex = t.date.getMonth();

      if (t.type === TransactionType.ENTRADA)
        monthlyData[monthIndex].income += t.amount;

      if (t.type === TransactionType.SAIDA)
        monthlyData[monthIndex].expense += t.amount;

      monthlyData[monthIndex].balance =
        monthlyData[monthIndex].income - monthlyData[monthIndex].expense;
    });

    // -----------------------------------------------------
    // PIE DATA
    // -----------------------------------------------------
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
    });

    const pieData = accounts.map((acc) => {
      const accTransactions = transactions.filter(
        (t) => t.accountId === acc.id
      );
      const value = accTransactions.reduce(
        (sum, t) =>
          sum + t.amount * (t.type === TransactionType.ENTRADA ? 1 : -1),
        0
      );
      return { name: acc.name, value };
    });

    // -----------------------------------------------------
    // CATEGORY EXPENSES
    // -----------------------------------------------------
    const categoryMap: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type !== TransactionType.SAIDA) return;
      if (!t.category) return;

      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const categoryExpenses = Object.entries(categoryMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------
    return NextResponse.json({
      success: true,
      period,
      filters: { month, year, accountId },
      summary,
      monthlyData,
      pieData,
      categoryExpenses,
      transactions,
    });

  } catch (error) {
    console.error("Erro no dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
