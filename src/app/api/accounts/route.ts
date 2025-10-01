import { NextRequest, NextResponse } from "next/server";
import { createAccount, listAccounts } from "@/lib/services/accountService";
import { requireAuth } from "@/lib/middlewares";
import { AccountType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req); 
    if (!user) throw new Error("Token inválido");

    const accounts = await listAccounts(user.id);
    return NextResponse.json(accounts);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unauthorized" },
      { status: err.message.includes("token") ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) throw new Error("Token inválido");

    const { name, type: typeString, balance } = await req.json();

    if (!name || !typeString) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // Verifica se o tipo enviado é válido
    if (!["CORRENTE", "POUPANCA"].includes(typeString)) {
      return NextResponse.json({ error: "Tipo de conta inválido" }, { status: 400 });
    }

    const account = await createAccount(
      user.id,
      name,
      typeString as AccountType,
      balance ?? 0
    );

    return NextResponse.json(account, { status: 201 });
  } catch (err: any) {
    const status =
      err.message.includes("token") || err.message.includes("autorização") ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Erro" }, { status });
  }
}
