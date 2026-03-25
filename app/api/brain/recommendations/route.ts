import { NextResponse } from "next/server";
import { recordPatternDecision, runLearningLoop } from "@/lib/brain-learning";

export async function GET() {
  const result = await runLearningLoop();
  return NextResponse.json({
    recommendations: result.recs,
    driftWarnings: result.driftWarnings,
    pendingPatterns: result.pendingPatterns,
    notToPost: result.notToPost
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.pattern || !body.decision) {
    return NextResponse.json({ error: "pattern and decision are required" }, { status: 400 });
  }
  const updated = await recordPatternDecision(body.pattern, body.decision);
  return NextResponse.json({ pendingPatterns: updated });
}
