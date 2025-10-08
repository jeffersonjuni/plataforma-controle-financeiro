import { AccountType } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * Cria uma nova conta
 */
export async function createAccount(
  userId: number,
  name: string,
  type: AccountType,
  balance: number = 0
) {
  // Verifica se o usuário existe
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) throw new Error("Usuário não encontrado");

  // Impede nome duplicado de conta para o mesmo usuário
  const existingAccount = await prisma.account.findFirst({
    where: { userId, name },
  });
  if (existingAccount) {
    throw new Error("Já existe uma conta com este nome");
  }

  // Cria a conta
  const newAccount = await prisma.account.create({
    data: {
      name,
      type,
      balance,
      userId,
    },
  });

  return newAccount;
}

/**
 * Lista contas de um usuário
 */
export async function listAccounts(userId: number) {
  if (!userId) throw new Error("userId é obrigatório");

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
      createdAt: true,
    },
  });

  return accounts;
}
