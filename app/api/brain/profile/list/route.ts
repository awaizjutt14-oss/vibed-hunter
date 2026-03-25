import { NextResponse } from "next/server";
import { listBrainProfiles, activateBrainProfile, loadBrainProfile } from "@/lib/brain-profile-store";

export async function GET() {
  const profiles = await listBrainProfiles();
  const active = await loadBrainProfile();
  return NextResponse.json({ profiles, active });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id } = body as { id: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const profile = await activateBrainProfile(id);
  return NextResponse.json({ active: profile });
}
