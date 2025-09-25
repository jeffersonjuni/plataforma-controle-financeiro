import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "./jwt";

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Credenciais inválidas");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Credenciais inválidas");

  // payload mínimo (LGPD): não colocar dados sensíveis
  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export function getUserFromToken(token: string) {
  const payload = verifyToken(token) as any;
  // payload contém userId e email (se usamos signToken acima)
  return { userId: payload.userId, email: payload.email };
}
