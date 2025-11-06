import prisma from "@/lib/prisma";
import { checkAccountLimit, checkDuplicateTransaction } from "./transactionValidations";
import { createLog } from "./logService";
import type { Transaction, Account } from "@prisma/client";
import { updateAccountBalance } from "../updateAccountBalance";


export type TransactionType = "ENTRADA" | "SAIDA";
export type TransactionCategory = "FIXA" | "VARIAVEL";

export async function createTransaction(
  accountId: number,
  description: string,
  amount: number,
  type: TransactionType,
  date?: string,
  category?: TransactionCategory,
  userId?: number // opcional para log
): Promise<Transaction> {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    await createLog("ERROR", "Conta não encontrada ao criar transação", { accountId, description, amount, type }, userId);
    throw new Error("Conta não encontrada");
  }

  if (!category) {
    await createLog("WARN", "Categoria não informada ao criar transação", { accountId, description, amount }, userId);
    throw new Error("A categoria é obrigatória (FIXA ou VARIAVEL)");
  }

  try {
    await checkAccountLimit(accountId, amount, type);
    await checkDuplicateTransaction(accountId, description, amount, date);

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        description,
        amount,
        type,
        category,
        date: date ? new Date(date) : undefined,
      },
    });

    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance:
          type === "ENTRADA"
            ? account.balance + amount
            : account.balance - amount,
      },
    });

    await createLog("AUDIT", "Transação criada com sucesso", { transactionId: transaction.id, accountId, amount, type, category }, userId);

    return transaction;
  } catch (err: any) {
    // loga o erro e repassa
    await createLog("ERROR", "Erro ao criar transação", { error: err.message, accountId, description, amount, type }, userId);
    throw err;
  }
}

export async function listTransactions(accountId: number): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { accountId },
    select: {
      id: true,
      accountId: true,
      description: true,
      amount: true,
      type: true,
      category: true,
      date: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function checkAccountOwnership(accountId: number, userId: number): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  return !!account;
}

export async function listTransactionsByUser(
  userId: number,
  month?: number,
  year?: number
): Promise<(Transaction & { account: Account })[]> {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true },
  });

  const accountIds = accounts.map(acc => acc.id);

  let dateFilter: { gte: Date; lt: Date } | undefined;

  if (month && year) {
    dateFilter = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  } else if (year) {
    dateFilter = {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1),
    };
  }

  return prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    include: { account: true },
    orderBy: { date: "desc" },
  });
}

export async function updateTransaction(
  id: number,
  accountId: number,
  description: string,
  amount: number,
  type: TransactionType,
  category: TransactionCategory,
  date?: string,
  userId?: number
): Promise<Transaction> {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      await createLog("ERROR", "Transação não encontrada para atualização", { id, accountId }, userId);
      throw new Error("Transação não encontrada");
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        description,
        amount,
        type,
        category,
        date: date ? new Date(date) : undefined,
      },
    });


    await updateAccountBalance(accountId);

    await createLog("AUDIT", "Transação atualizada com sucesso", { transactionId: id, accountId }, userId);
    return updated;
  } catch (err: any) {
    await createLog("ERROR", "Erro ao atualizar transação", { error: err.message, id, accountId }, userId);
    throw err;
  }
}


export async function deleteTransaction(
  id: number,
  accountId: number,
  userId?: number
): Promise<void> {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      await createLog("ERROR", "Transação não encontrada para exclusão", { id, accountId }, userId);
      throw new Error("Transação não encontrada");
    }

    await prisma.transaction.delete({ where: { id } });

    
    await updateAccountBalance(accountId);

    await createLog("AUDIT", "Transação excluída com sucesso", { transactionId: id, accountId }, userId);
  } catch (err: any) {
    await createLog("ERROR", "Erro ao excluir transação", { error: err.message, id, accountId }, userId);
    throw err;
  }
}
