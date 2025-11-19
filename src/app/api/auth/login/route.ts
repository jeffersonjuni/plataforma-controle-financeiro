import { NextResponse } from "next/server";
import { loginLimiter } from "@/lib/rateLimit";
import { loginUser } from "@/lib/authService";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  try {
    // Rate limit
    await loginLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 1 minuto." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Login error:", err);

    return NextResponse.json(
      { error: err.message || "Erro no servidor" },
      { status: 400 }
    );
  }
}
