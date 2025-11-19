import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";


export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const accountId = Number(url.searchParams.get("accountId"));
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));

    if (!accountId)
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });

    if (!month || !year)
      return NextResponse.json({ error: "Missing month or year" }, { status: 400 });

    // ======================
    // 🔢 Cálculo do intervalo correto
    // ======================
    const startDate = new Date(year, month - 1, 1); // mês -1 (JS começa no 0)
    const endDate = new Date(year, month, 1);       // próximo mês

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);

  } catch (err) {
    console.error("GET /transactions error →", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { accountId, description, amount, type, category, date } = body;

    if (!accountId || !description || !amount || !type || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔐 Registro de auditoria
    await prisma.log.create({
      data: {
        level: "AUDIT",
        message: "Transação criada",
        userId: decoded.userId,
        meta: body,
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        accountId: Number(accountId),
        description,
        amount,
        type,
        category,
        date: new Date(date + "T12:00:00"), // evitando timezone shift
      },
    });

    return NextResponse.json(transaction);

  } catch (err) {
    console.error("POST /transactions error →", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
