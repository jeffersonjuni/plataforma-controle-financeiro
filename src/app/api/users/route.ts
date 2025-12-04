import { NextRequest, NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/services/userService";
import { registerLimiter } from "@/lib/rateLimit";

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // 🔥 Rate Limit: impede bots criando usuários
  try {
    await registerLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      {
        error: "Muitas solicitações de cadastro. Tente novamente em 1 minuto.",
      },
      { status: 429 }
    );
  }

  try {
    const data = await req.json();
    const { name, email, password } = data;

    // ⚠ Validação obrigatória
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // ⚠ Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase())) {
      return NextResponse.json(
        { error: "Email inválido. Insira um formato válido." },
        { status: 400 }
      );
    }

    // ⚠ Validação de senha forte
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "A senha deve ter ao menos 8 caracteres, incluindo: letra maiúscula, minúscula, número e símbolo.",
        },
        { status: 400 }
      );
    }

    // Criar usuário
    const newUser = await createUser(name, email, password);

    return NextResponse.json(newUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
