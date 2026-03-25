import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Instagram integration disabled." }, { status: 404 });
}
export const runtime = "nodejs";
