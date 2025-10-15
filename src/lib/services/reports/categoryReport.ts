import prisma from "@/lib/prisma";

// Tipo de retorno parcial, antes de mapear para TransactionReport
type CategoryData = {
  category: string;
  amount: number;
};

/**
 * Retorna relatório de despesas por categoria para um usuário, mês e ano específicos
 */
export async function getCategoryReport(
  userId: number,
  month: number,
  year: number
): Promise<CategoryData[]> {
  // Ajuste de datas
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Buscar transações do tipo SAIDA
  const transactions = await prisma.transaction.findMany({
    where: {
      account: {userId} ,
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

  // Agrupar por categoria
  const grouped: Record<string, number> = {};
  transactions.forEach((t) => {
    const cat = t.category || "OUTROS";
    if (!grouped[cat]) grouped[cat] = 0;
    grouped[cat] += t.amount;
  });

  // Transformar em array
  return Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount,
  }));
}
