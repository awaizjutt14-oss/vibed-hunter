import { NextResponse } from "next/server";
import { rebuildTrendClusters } from "@/lib/trends/service";

export async function POST() {
  const results = await rebuildTrendClusters();
  return NextResponse.json({ ok: true, results });
}
