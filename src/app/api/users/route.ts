import { NextRequest, NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/services/userService";

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, password } = data;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const newUser = await createUser(name, email, password);
    return NextResponse.json(newUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
