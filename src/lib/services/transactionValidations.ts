import prisma from "@/lib/prisma";
import type { TransactionType } from "./transactionService";
import { createLog } from "./logService";

export async function checkAccountLimit(
  accountId: number,
  amount: number,
  type: TransactionType
) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    await createLog("ERROR", "Conta não encontrada em checkAccountLimit", { accountId });
    throw new Error("Conta não encontrada");
  }

  if (type === "SAIDA" && account.balance - amount < 0) {
    await createLog("WARN", "Saldo insuficiente detectado", { accountId, balance: account.balance, amount });
    throw new Error("Saldo insuficiente para realizar a transação");
  }

  return true;
}

export async function checkDuplicateTransaction(
  accountId: number,
  description: string,
  amount: number,
  date?: string
) {
  const whereClause = {
    accountId,
    description,
    amount,
    date: date ? new Date(date) : undefined,
  };

  const existing = await prisma.transaction.findFirst({
    where: whereClause as any,
  });

  if (existing) {
    await createLog("WARN", "Transação duplicada detectada", { accountId, description, amount, date });
    throw new Error("Transação duplicada detectada");
  }

  return true;
}
