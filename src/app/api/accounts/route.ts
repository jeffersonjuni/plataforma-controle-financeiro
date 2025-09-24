import { NextRequest, NextResponse } from "next/server";
import { createAccount, listAccounts } from "@/lib/services/accountService";

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });

  try {
    const accounts = await listAccounts(userId);
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, type, balance } = await req.json();
    if (!userId || !name || !type) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const newAccount = await createAccount(userId, name, type, balance ?? 0);
    return NextResponse.json(newAccount);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
