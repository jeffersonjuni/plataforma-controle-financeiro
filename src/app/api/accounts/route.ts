import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/authService";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user)
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });

    const { name, balance, type } = await req.json();

    if (!name || balance === undefined || !type) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const accountType = type.toUpperCase();
    if (!["CORRENTE", "POUPANCA", "INVESTIMENTO"].includes(accountType)) {
      return NextResponse.json(
        { error: "Tipo de conta inválido" },
        { status: 400 }
      );
    }

    const newAccount = await prisma.account.create({
      data: {
        name,
        balance,
        type: accountType,
        userId: user.id,
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user)
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });

    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { transactions: true },
    });

    // saldo REAL baseado apenas nas transações
    const accountsWithUpdatedBalance = accounts.map((acc) => {
      const total = acc.transactions.reduce(
        (sum, t) => sum + (t.type === "ENTRADA" ? t.amount : -t.amount),
        0
      );

      return {
        ...acc,
        balance: total, // 👈 saldo real definido pelas transações
      };
    });

    return NextResponse.json(accountsWithUpdatedBalance);
  } catch (error: any) {
    console.error("Erro ao carregar contas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
