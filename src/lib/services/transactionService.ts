import prisma from "@/lib/prisma";

/**
 * Cria uma transação e atualiza o saldo da conta
 */
export async function createTransaction(
  accountId: number,
  description: string,
  amount: number,
  type: "ENTRADA" | "SAIDA" // Melhor tipagem para evitar erros de string
) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new Error("Conta não encontrada");

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
        ? account.balance + amount
        : account.balance - amount,
    },
  });

  return transaction;
}

/**
 * Lista todas as transações de uma conta
 */
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

/**
 * Verifica se a conta pertence ao usuário
 */
export async function checkAccountOwnership(accountId: number, userId: number): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  return !!account; // true se existe, false caso contrário
}
