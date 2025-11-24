import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro no servidor" },
      { status: 500 }
    );
  }
}
