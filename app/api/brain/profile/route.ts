import { NextResponse } from "next/server";
import { exportBrainProfile, importBrainProfile, loadBrainProfile } from "@/lib/brain-profile-store";

export async function GET() {
  const profile = await loadBrainProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.profile) return NextResponse.json({ error: "profile required" }, { status: 400 });
  const profile = await importBrainProfile(body.profile);
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!body?.profile) return NextResponse.json({ error: "profile required" }, { status: 400 });
  const profile = await importBrainProfile(body.profile);
  return NextResponse.json({ profile });
}
export const runtime = "nodejs";
