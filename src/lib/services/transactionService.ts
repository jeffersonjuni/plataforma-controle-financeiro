import prisma from "@/lib/prisma";

export async function createTransaction(accountId: number, description: string, amount: number, type: string) {
  const accountExists = await prisma.account.findUnique({ where: { id: accountId } });
  if (!accountExists) throw new Error("Conta não encontrada");

  const transaction = await prisma.transaction.create({
    data: {
      description,
      amount,
      type,
      accountId,
    },
  });

  // Atualiza saldo da conta
  await prisma.account.update({
    where: { id: accountId },
    data: {
      balance: type === "ENTRADA"
        ? accountExists.balance + amount
        : accountExists.balance - amount,
    },
  });

  return transaction;
}

export async function listTransactions(accountId: number) {
  return prisma.transaction.findMany({
    where: { accountId },
    select: {
      id: true,
      description: true,
      amount: true,
      type: true,
      date: true,
    },
    orderBy: { date: "desc" },
  });
}
