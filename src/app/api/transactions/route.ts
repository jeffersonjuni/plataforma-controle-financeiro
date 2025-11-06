import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId");
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));

    if (!accountId) {
      return NextResponse.json({ error: "accountId é obrigatório" }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: Number(accountId),
        account: { userId: decoded.userId },
        ...(month && year && {
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        }),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Erro ao listar transações:", error);
    return NextResponse.json({ error: "Erro ao listar transações" }, { status: 500 });
  }
}
