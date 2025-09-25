import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Verifique Email ou Senha e tente novamente" }, { status: 400 });
    }

    const result = await loginUser(email.toLowerCase(), password);
    // Retorna token e alguns dados não sensíveis do usuário
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Auth login error:", err.message ?? err);
    return NextResponse.json({ error: err.message ?? "Falha na autenticação" }, { status: 401 });
  }
}
