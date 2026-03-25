import { NextResponse } from "next/server";
import { resetBrainProfile } from "@/lib/brain-profile-store";

export async function POST() {
  const profile = await resetBrainProfile();
  return NextResponse.json({ profile, reset: true });
}
export const runtime = "nodejs";
