import { NextRequest, NextResponse } from "next/server";
import { createTransaction, listTransactions, checkAccountOwnership } from "@/lib/services/transactionService";
import { requireAuth } from "@/lib/middlewares";

// Tipo de usuário retornado pelo requireAuth
interface AuthUser {
  userId: number;
  email?: string;
}

export async function GET(req: NextRequest) {
  try {
    const user: AuthUser = requireAuth(req);

    const accountIdParam = req.nextUrl.searchParams.get("accountId");
    if (!accountIdParam) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const accountId = Number(accountIdParam);
    if (isNaN(accountId)) {
      return NextResponse.json({ error: "accountId must be a number" }, { status: 400 });
    }

    // Verifica se a conta pertence ao usuário
    const isOwned = await checkAccountOwnership(accountId, user.userId);
    if (!isOwned) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await listTransactions(accountId);
    return NextResponse.json(transactions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user: AuthUser = requireAuth(req);

    const body = await req.json();
    const { accountId, description, amount, type } = body;

    if (!accountId || !description || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });
    }

    // Verifica se a conta pertence ao usuário
    const isOwned = await checkAccountOwnership(accountId, user.userId);
    if (!isOwned) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transaction = await createTransaction(accountId, description, numericAmount, type);
    return NextResponse.json(transaction, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error creating transaction" }, { status: 400 });
  }
}
