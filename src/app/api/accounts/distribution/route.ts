import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/authService";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Busca todas as contas do usuário
    const accounts = await prisma.account.findMany({
      where: { userId: decoded.userId },
    });

    const distribution = accounts.map((acc) => ({
      name: acc.name,
      value: Number(acc.balance) || 0,
    }));

    return NextResponse.json(distribution);
  } catch (error: any) {
    console.error("Erro em /api/accounts/distribution:", error);
    return NextResponse.json(
      { error: "Erro ao buscar distribuição por conta" },
      { status: 500 }
    );
  }
}
