import { NextRequest } from "next/server";
import { getUserFromToken } from "./authService";

export function extractTokenFromRequest(req: NextRequest | Request) {

  const authHeader = (req as any).headers?.get?.("authorization") || (req as any).headers?.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

export function requireAuth(req: NextRequest | Request) {
  const token = extractTokenFromRequest(req);
  if (!token) throw new Error("Nenhum token fornecido");
  const user = getUserFromToken(token); // pode lançar se inválido
  return user; // { userId, email }
}
