import { NextRequest, NextResponse } from "next/server";
import { createAccount, listAccounts } from "@/lib/services/accountService";
import { requireAuth } from "@/lib/middlewares";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req); // lança se token inválido
    // user.userId vem do token
    const accounts = await listAccounts(Number(user.userId));
    return NextResponse.json(accounts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const { name, type, balance } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const account = await createAccount(Number(user.userId), name, type, balance ?? 0);
    return NextResponse.json(account, { status: 201 });
  } catch (err: any) {
    const status = err.message === "Nenhum token fornecido" || err.message === "Token inválido ou expirado" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Error" }, { status });
  }
}
