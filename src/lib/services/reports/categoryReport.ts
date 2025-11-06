import prisma from "@/lib/prisma";

type CategoryData = {
  category: string;
  amount: number;
};

export async function getCategoryReport(
  userId: number,
  month: number,
  year: number,
  accountId?: number
): Promise<CategoryData[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const where: any = {
    account: { userId },
    type: "SAIDA",
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (accountId) {
    where.accountId = accountId;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      amount: true,
      category: true,
    },
  });

  const grouped: Record<string, number> = {};
  transactions.forEach((t) => {
    const cat = t.category || "OUTROS";
    if (!grouped[cat]) grouped[cat] = 0;
    grouped[cat] += t.amount;
  });

  return Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount,
  }));
}
