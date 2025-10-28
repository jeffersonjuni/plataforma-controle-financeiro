import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo";

// Função para extrair o userId do token
function getUserIdFromToken(token: string): number | null {
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    return payload.userId; 
  } catch (err) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, defaultExport: true } 
    });

    const categories = await prisma.category.findMany({
      where: { userId },
      select: { name: true }
    });

    return NextResponse.json({ user, categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await req.json();
    const { name, email, password, defaultExport, categories } = body;

    const data: any = { name, email };
    if (defaultExport) data.defaultExport = defaultExport;
    if (password) data.password = await bcrypt.hash(password, 10);

    await prisma.user.update({ where: { id: userId }, data });

    // Atualiza categorias
    await prisma.category.deleteMany({ where: { userId } });
    if (categories && categories.length) {
      const createCats = categories.map((name: string) => ({ userId, name }));
      await prisma.category.createMany({ data: createCats });
    }

    return NextResponse.json({ message: "Configurações atualizadas com sucesso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
