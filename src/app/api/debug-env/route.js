import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    db_url: process.env.DATABASE_URL || "NOT FOUND",
  });
}
