import { PrismaClient, TransactionType, TransactionCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Função para gerar transações por mês
function gerarTransacoesMensais(accountId: number, ano: number, mes: number) {
  const day = (d: number) => new Date(ano, mes - 1, d);

  const salarioValor = Number(random(2800, 3200).toFixed(2));

  const transacoes = [
    {
      description: "Salário",
      amount: salarioValor,
      type: TransactionType.ENTRADA,
      date: day(3),
      category: TransactionCategory.FIXA,
    },
    {
      description: "Aluguel",
      amount: 1200,
      type: TransactionType.SAIDA,
      date: day(5),
      category: TransactionCategory.FIXA,
    },
    {
      description: "Mercado",
      amount: Number(random(350, 650).toFixed(2)),
      type: TransactionType.SAIDA,
      date: day(10),
      category: TransactionCategory.VARIAVEL,
    },
    {
      description: "Transporte",
      amount: Number(random(120, 250).toFixed(2)),
      type: TransactionType.SAIDA,
      date: day(15),
      category: TransactionCategory.VARIAVEL,
    },
    {
      description: "Lazer",
      amount: Number(random(60, 200).toFixed(2)),
      type: TransactionType.SAIDA,
      date: day(20),
      category: TransactionCategory.VARIAVEL,
    },
    {
      description: "PIX enviado",
      amount: Number(random(20, 150).toFixed(2)),
      type: TransactionType.SAIDA,
      date: day(22),
      category: TransactionCategory.VARIAVEL,
    }
  ];

  // Chance de depósito extra
  if (Math.random() < 0.4) {
    transacoes.push({
      description: "Depósito",
      amount: Number(random(50, 150).toFixed(2)),
      type: TransactionType.ENTRADA,
      date: day(12),
      category: TransactionCategory.FIXA,
    });
  }

  // Chance de mês no vermelho
  if (Math.random() < 0.3) {
    transacoes.push({
      description: "Compra inesperada",
      amount: Number(random(200, 500).toFixed(2)),
      type: TransactionType.SAIDA,
      date: day(18),
      category: TransactionCategory.VARIAVEL,
    });
  }

  return transacoes;
}

async function main() {
  console.log("🌱 Criando usuário...");

  const hash = await bcrypt.hash("Senha123*", 10);

  const user = await prisma.user.create({
    data: {
      name: "Usuário Teste",
      email: "usuario.teste@example.com",
      password: hash,
    },
  });

  console.log("✔ Usuário criado");

  const conta = await prisma.account.create({
    data: {
      name: "Conta Corrente Nubank",
      type: "CORRENTE",
      userId: user.id,
    },
  });

  console.log("✔ Conta criada");

  const meses = [
    [2024, 1], [2024, 2], [2024, 3], [2024, 4], [2024, 5], [2024, 6],
    [2024, 7], [2024, 8], [2024, 9], [2024, 10], [2024, 11], [2024, 12],
    [2025, 1], [2025, 2], [2025, 3], [2025, 4], [2025, 5], [2025, 6],
    [2025, 7], [2025, 8], [2025, 9], [2025, 10], [2025, 11]
  ];

  for (const [ano, mes] of meses) {
    const transacoes = gerarTransacoesMensais(conta.id, ano, mes);

    for (const t of transacoes) {
      await prisma.transaction.create({
        data: {
          accountId: conta.id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          date: t.date,
          category: t.category,
        },
      });
    }
  }

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
