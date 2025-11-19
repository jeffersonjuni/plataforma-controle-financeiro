import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { signToken, verifyToken } from "./jwt";

// Criar token (se precisar fora do login)
export function generateToken(user: { id: number; name: string; email: string }) {
  return signToken({
    userId: user.id,
    name: user.name,
    email: user.email,
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuário não encontrado");

  const valid = await bcrypt.compare(password, user.password.trim());
  if (!valid) throw new Error("Senha inválida");

  const token = generateToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  return await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true },
  });
}

export { verifyToken } from "./jwt";