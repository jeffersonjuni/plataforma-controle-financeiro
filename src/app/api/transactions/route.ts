import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/authService";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Buscar todas as transações do usuário autenticado
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId: decoded.userId,
        },
      },
      include: { account: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao listar transações" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { accountId, description, amount, type, date, category } =
      await req.json();

    if (!accountId || !description || !amount || !type) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        description,
        amount,
        type,
        category: category ?? "VARIAVEL", // default se não mandar
        date: date ? new Date(date) : undefined, // usa a enviada ou default do Prisma
      },
    });

    // Atualizar saldo da conta
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance:
          type === "ENTRADA"
            ? { increment: amount }
            : { decrement: amount },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}
