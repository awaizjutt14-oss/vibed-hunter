import { NextResponse } from "next/server";
import { getAllFeedback, setFeedback, FeedbackRating, FeedbackReason } from "@/lib/brain-feedback-store";
import { loadBrainProfile } from "@/lib/brain-profile-store";

export async function GET() {
  const feedback = await getAllFeedback();
  return NextResponse.json({ feedback });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, rating, reasons } = body as { id: string; rating: FeedbackRating; reasons: FeedbackReason[] };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const profileSnapshot = await loadBrainProfile();
  await setFeedback({ id, rating: rating ?? "", reasons: reasons ?? [], profileSnapshot });
  return NextResponse.json({ ok: true });
}
