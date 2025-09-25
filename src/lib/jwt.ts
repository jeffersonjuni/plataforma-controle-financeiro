import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido nas variáveis de ambiente");
}

export function signToken(payload: string | object | Buffer) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as object | string;
  } catch (err) {
    throw new Error("Token inválido ou expirado");
  }
}
