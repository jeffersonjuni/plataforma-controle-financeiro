import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser(name: string, email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Verifica se o usuário já existe
  const userExists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (userExists) {
    throw new Error("Já existe um usuário cadastrado com este email.");
  }

  // Hash seguro
  const passwordHash = await bcrypt.hash(password, 12); // custo 12 (bom para produção)

  const newUser = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return newUser;
}

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
