import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "replace_this_secret";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas que não precisam de login
  const publicPaths = ["/login", "/"];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Pega token do cookie
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded?.userId) throw new Error("Token inválido");
    return NextResponse.next(); // usuário autenticado
  } catch (err) {
    console.error("Token inválido no middleware:", err);
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/transacoes/:path*", "/relatorios/:path*", "/contas/:path*"],
};
