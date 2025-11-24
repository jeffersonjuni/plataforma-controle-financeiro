import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { mailer } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Se existir, enviaremos um email." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // LGPD: nunca revelar se existe ou não
    if (!user) {
      return NextResponse.json({ message: "Se existir, enviaremos um email." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExp: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    await mailer.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Redefinição de senha",
      html: `
        <p>Você solicitou a redefinição de senha.</p>
        <p>Clique no link abaixo para continuar:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este link expira em 10 minutos.</p>
      `,
    });

    return NextResponse.json({
      message: "Se existir, enviaremos um email.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Erro no servidor" },
      { status: 500 }
    );
  }
}
