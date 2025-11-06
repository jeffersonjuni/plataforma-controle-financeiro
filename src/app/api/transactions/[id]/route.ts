import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { createLog } from "@/lib/services/logService";
import {
  updateTransaction,
  deleteTransaction,
  checkAccountOwnership,
} from "@/lib/services/transactionService";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await req.json();
    const { accountId, description, amount, type, category, date } = body;

    if (!accountId || !description || !amount || !type || !category) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    
    const isOwner = await checkAccountOwnership(accountId, decoded.userId);
    if (!isOwner) {
      await createLog("WARN", "Tentativa de atualizar transação em conta que não pertence ao usuário", { accountId, userId: decoded.userId });
      return NextResponse.json({ error: "Conta não pertence ao usuário" }, { status: 403 });
    }

    const updated = await updateTransaction(
      id,
      accountId,
      description,
      amount,
      type,
      category,
      date,
      decoded.userId
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Erro no PUT /api/transactions/[id]:", err);
    await createLog("ERROR", "Erro no PUT /api/transactions/[id]", { error: err.message });
    return NextResponse.json({ error: err.message || "Erro ao atualizar transação" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: "accountId é obrigatório" }, { status: 400 });
    }

    const isOwner = await checkAccountOwnership(accountId, decoded.userId);
    if (!isOwner) {
      await createLog("WARN", "Tentativa de excluir transação de conta que não pertence ao usuário", { accountId, userId: decoded.userId });
      return NextResponse.json({ error: "Conta não pertence ao usuário" }, { status: 403 });
    }

    await deleteTransaction(id, accountId, decoded.userId);
    return NextResponse.json({ message: "Transação excluída com sucesso" });
  } catch (err: any) {
    console.error("Erro no DELETE /api/transactions/[id]:", err);
    await createLog("ERROR", "Erro no DELETE /api/transactions/[id]", { error: err.message });
    return NextResponse.json({ error: err.message || "Erro ao excluir transação" }, { status: 500 });
  }
}
