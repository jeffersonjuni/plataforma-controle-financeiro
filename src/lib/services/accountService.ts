import prisma from "@/lib/prisma";

export async function createAccount(userId: number, name: string, type: string, balance: number = 0) {
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) throw new Error("Usuário não encontrado");

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

export async function listAccounts(userId: number) {
  return prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
      createdAt: true,
    },
  });
}
