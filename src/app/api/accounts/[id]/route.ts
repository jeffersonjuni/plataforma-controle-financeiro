import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/authService";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user)
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });

    const accountId = Number(params.id);
    const body = await req.json();
    const { name, balance, type } = body;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== user.id) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (name) data.name = name;
    if (balance !== undefined) data.balance = balance;

    if (type) {
      const t = type.toUpperCase();
      if (!["CORRENTE", "POUPANCA", "INVESTIMENTO"].includes(t)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
      }
      data.type = t;
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user)
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });

    const accountId = Number(params.id);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== user.id) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    await prisma.account.delete({
      where: { id: accountId },
    });

    return NextResponse.json({ message: "Conta excluída com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
