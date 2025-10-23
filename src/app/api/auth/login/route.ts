import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "replace_this_secret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });

    if (!user.password) {
      return NextResponse.json({ error: "Senha do usuário não definida" }, { status: 500 });
    }

    const isValid = await bcrypt.compare(password, user.password.trim());
    if (!isValid) return NextResponse.json({ error: "Senha inválida" }, { status: 401 });

    // Assinando o JWT com userId para compatibilidade com validação
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
