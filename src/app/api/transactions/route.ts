import { NextRequest, NextResponse } from "next/server";
import { createTransaction, listTransactions } from "@/lib/services/transactionService";

export async function GET(req: NextRequest) {
  const accountId = Number(req.nextUrl.searchParams.get("accountId"));
  if (!accountId) return NextResponse.json({ error: "accountId obrigatório" }, { status: 400 });

  try {
    const transactions = await listTransactions(accountId);
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accountId, description, amount, type } = await req.json();
    if (!accountId || !description || !amount || !type) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const newTransaction = await createTransaction(accountId, description, amount, type);
    return NextResponse.json(newTransaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
