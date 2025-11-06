import prisma from "@/lib/prisma";

export async function updateAccountBalance(accountId: number) {
  
  const transactions = await prisma.transaction.findMany({
    where: { accountId },
  });


  const newBalance = transactions.reduce((acc, t) => {
    return t.type === "ENTRADA" ? acc + Number(t.amount) : acc - Number(t.amount);
  }, 0);

  
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance },
  });
}
