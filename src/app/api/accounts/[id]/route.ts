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

    const body = await req.json();
    const { name, balance, type } = body;

    const data: any = { name, balance };
    if (type) {
      const accountType = type.toUpperCase();
      if (!["CORRENTE", "POUPANCA", "INVESTIMENTO"].includes(accountType)) {
        return NextResponse.json(
          { error: "Tipo de conta inválido" },
          { status: 400 }
        );
      }
      data.type = accountType;
    }

    const updatedAccount = await prisma.account.update({
      where: { id: Number(params.id), userId: user.id },
      data,
    });

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error("Erro ao atualizar conta:", error);
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

    await prisma.account.delete({
      where: { id: Number(params.id), userId: user.id },
    });

    return NextResponse.json({ message: "Conta deletada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar conta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
