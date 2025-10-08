import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import {
  createTransaction,
  listTransactionsByUser,
  checkAccountOwnership,
} from "@/lib/services/transactionService";
import {
  checkAccountLimit,
  checkDuplicateTransaction,
} from "@/lib/services/transactionValidations";
import { createLog } from "@/lib/services/logService";

function parseMonth(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n)) return undefined;
  if (n < 1 || n > 12) return undefined;
  return n;
}

function parseYear(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n)) return undefined;
  if (n < 1900 || n > 2100) return undefined;
  return n;
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const monthParam = url.searchParams.get("month");
    const yearParam = url.searchParams.get("year");

    const month = parseMonth(monthParam);
    const year = parseYear(yearParam);

    // Se passaram valores inválidos explicitamente -> 400
    if ((monthParam !== null && month === undefined) || (yearParam !== null && year === undefined)) {
      await createLog("WARN", "Parâmetros de data inválidos no GET /api/transactions", { monthParam, yearParam }, decoded.userId);
      return NextResponse.json({ error: "Parâmetros inválidos: month deve ser 1-12 e year entre 1900-2100" }, { status: 400 });
    }

    // lógica: se passar mês sem ano ignoramos o mês
    const effectiveMonth = month && year ? month : undefined;

    const transactions = await listTransactionsByUser(decoded.userId, effectiveMonth, year);
    return NextResponse.json(transactions);
  } catch (err: any) {
    console.error(err);
    await createLog("ERROR", "Erro no GET /api/transactions", { error: err.message }, undefined);
    return NextResponse.json({ error: "Erro ao listar transações" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { accountId, description, amount, type, date, category } = await req.json();

    if (!accountId || !description || !amount || !type) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Verifica se a conta pertence ao usuário
    const isOwner = await checkAccountOwnership(accountId, decoded.userId);
    if (!isOwner) {
      await createLog("WARN", "Tentativa de criar transação em conta que não pertence ao usuário", { accountId, userId: decoded.userId });
      return NextResponse.json({ error: "Conta não pertence ao usuário" }, { status: 403 });
    }

    // Categoria obrigatória (já valida também no service)
    if (!category) {
      await createLog("WARN", "Categoria não informada no POST /api/transactions", { accountId, userId: decoded.userId });
      return NextResponse.json({ error: "A categoria é obrigatória" }, { status: 400 });
    }

    // Valida duplicidade e limite de conta (serviços já logam detalhes)
    await checkAccountLimit(accountId, amount, type);
    await checkDuplicateTransaction(accountId, description, amount, date);

    const transaction = await createTransaction(accountId, description, amount, type, date, category, decoded.userId);

    return NextResponse.json(transaction, { status: 201 });
  } catch (err: any) {
    console.error(err);
    await createLog("ERROR", "Erro no POST /api/transactions", { error: err.message }, undefined);
    const status = err.message && (err.message.includes("duplicada") || err.message.includes("Saldo insuficiente") || err.message.includes("categoria")) ? 400 : 500;
    return NextResponse.json({ error: err.message || "Erro ao criar transação" }, { status });
  }
}
