import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingestion/service";
import { rebuildTrendClusters } from "@/lib/trends/service";

export async function POST() {
  const ingestion = await runIngestion();
  const clusters = await rebuildTrendClusters();
  return NextResponse.json({
    ok: true,
    message: `Ingested ${ingestion.reduce((sum, item) => sum + item.imported, 0)} items and rebuilt ${clusters.length} clusters.`,
    ingestion,
    clusters
  });
}
export const runtime = "nodejs";
