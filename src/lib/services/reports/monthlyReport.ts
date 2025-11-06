import prisma from "@/lib/prisma";

export async function getMonthlyReport(userId: number, month: number, year: number, accountId?: number) {
  const where: any = {
    account: { userId },
    date: {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    },
  };

  if (accountId) {
    where.accountId = accountId;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { account: true },
    orderBy: { date: "asc" },
  });

  let balanceAccum = 0;

  const detailedReport = transactions.map((t) => {
    if (t.type === "ENTRADA") balanceAccum += t.amount;
    else if (t.type === "SAIDA") balanceAccum -= t.amount;

    return {
      date: t.date,
      account: t.account.name || t.account.type,
      category: t.category,
      type: t.type,
      amount: t.amount,
      balanceAccumulated: balanceAccum,
    };
  });

  return detailedReport;
}
