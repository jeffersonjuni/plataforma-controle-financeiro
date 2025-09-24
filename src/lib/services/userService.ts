import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// usuário com hash de senha
export async function createUser(name: string, email: string, password: string) {
  // Verifica se o usuário já existe
  const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, });
  if (userExists) {
    throw new Error("Usuário já cadastrado");
  }

  // Hash da senha (LGPD-friendly)
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: passwordHash,
    },
  });

  return newUser;
}

// Listar todos os usuários
export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
}
