import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "";

// Schema com senha opcional e string vazia ignorada
const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  email: z.string().email().max(120).optional(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha precisa de letra maiúscula")
    .regex(/[a-z]/, "Senha precisa de letra minúscula")
    .regex(/\d/, "Senha precisa de número")
    .regex(/[\W_]/, "Senha precisa de caractere especial")
    .optional(),
});

// extrair userId
function extractUserId(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = extractUserId(token);
    if (!userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Erro GET config:", err);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = extractUserId(token);
    if (!userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await req.json();

    // remover senha vazia
    if (body.password === "") {
      delete body.password;
    }

    // validar body
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if (parsed.data.name) dataToUpdate.name = parsed.data.name.trim();
    if (parsed.data.email) dataToUpdate.email = parsed.data.email.trim();

    if (parsed.data.password) {
      dataToUpdate.password = await bcrypt.hash(parsed.data.password, 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado enviado para atualização" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Configurações atualizadas com sucesso",
    });

  } catch (err) {
    console.error("Erro PATCH config:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
