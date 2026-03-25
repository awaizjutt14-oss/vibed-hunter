import { NextResponse } from "next/server";
import { addBrainExample, listBrainExamples, BrainExampleType } from "@/lib/brain-examples-store";

export async function GET() {
  const items = await listBrainExamples();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, text, quality, notes } = body as { type: BrainExampleType; text: string; quality: "good" | "bad"; notes?: string };
  if (!type || !text || !quality) return NextResponse.json({ error: "type, text, quality required" }, { status: 400 });
  await addBrainExample({ type, text, quality, notes });
  return NextResponse.json({ ok: true });
}
export const runtime = "nodejs";
