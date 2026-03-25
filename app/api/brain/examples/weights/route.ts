import { NextResponse } from "next/server";
import { listBrainExamples } from "@/lib/brain-examples-store";

export async function GET() {
  const items = await listBrainExamples();
  // Simple derived weights: bump match scores when good examples exist, penalize when bad examples exist
  const weights = {
    hookBoost:
      items.filter((item) => item.type === "hook-good").length * 0.5 -
      items.filter((item) => item.type === "hook-bad").length * 0.5,
    captionBoost:
      items.filter((item) => item.type === "caption-good").length * 0.4 -
      items.filter((item) => item.type === "caption-bad").length * 0.4,
    postBoost:
      items.filter((item) => item.type === "great-post").length * 0.6 -
      items.filter((item) => item.type === "bad-post").length * 0.6
  };
  return NextResponse.json({ weights });
}
export const runtime = "nodejs";
