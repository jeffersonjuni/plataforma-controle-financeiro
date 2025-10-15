import prisma from "@/lib/prisma";

export async function getAnnualReport(userId: number, year: number) {
  // Busca todas as transações do usuário no ano
  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId },
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    include: { account: true }, // pegar nome/tipo da conta
    orderBy: { date: "asc" },   // importante para saldo acumulado
  });

  let balanceAccum = 0;

  // Mapeia cada transação com saldo acumulado e informações detalhadas
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
