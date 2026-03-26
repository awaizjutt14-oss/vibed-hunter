import { NextResponse } from "next/server";
import { getCurrentTrialStatus } from "@/lib/generation-access";

export const runtime = "nodejs";

export async function GET() {
  const { trial } = await getCurrentTrialStatus();
  return NextResponse.json(trial);
}

