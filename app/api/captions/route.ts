import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

type ReqBody = {
  topic?: string;
  platform?: "instagram" | "tiktok" | "youtube";
  contentType?: string;
};

const fallback = {
  hook: "Machine slices metal threads thinner than hair",
  caption:
    "Zero wobble, zero mercy for mistakes\nBlade rides a micron-thin path\nOne slip = scrap the whole run\nWhy it matters: parts fit like magic\nWould you trust this level of precision?",
  pinned_comment: "Ever tried machining below human hair width?",
  cta: "Follow @vibed.media for more content like this",
  hashtags: ["#engineering", "#precision", "#satisfying", "#manufacturing"]
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ReqBody;
  const topic = (body.topic ?? "")?.toString().slice(0, 300).trim();
  const platform = (body.platform ?? "instagram") as ReqBody["platform"];
  const contentType = (body.contentType ?? "engineering")?.toString();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // No key in env; return a safe fallback so the app works in demo mode
    return NextResponse.json({ ...fallback, note: "Using demo fallback (no OPENAI_API_KEY set)" });
  }

  const client = new OpenAI({ apiKey });

  const prompt = `You are a viral caption engine for short-form (Reels/TikTok/Shorts).
Follow this structure exactly and output JSON:
{
  "hook": "8-9 word hook",
  "caption": "multi-line caption",
  "cta": "Follow @vibed.media for more content like this",
  "pinned_comment": "one engaging question",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}

Structure rules:
1) HOOK: 8-9 words, shocking/curiosity, no fluff.
2) BODY (short lines): strong opening, 2-4 short lines, simple words, fast rhythm.
3) TENSION: add risk/precision/one mistake = fail.
4) PAYOFF: why it matters / what’s happening.
5) END: curiosity question or strong statement.
6) CTA: include the exact line "Follow @vibed.media for more content like this" (separate field).
7) HASHTAGS: 3-4, niche, no spam.

Platform mode: ${platform}. TikTok = shorter/punchier; YouTube = slightly more informative; Instagram = full format.
Content focus: ${contentType}.
Topic: ${topic}.
Style: clean, modern, minimal; smart tech explained simply; no long paragraphs; minimal emojis.
Rewrite until it feels viral.`;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 300
    });

    const content = completion.choices[0]?.message?.content ?? "";
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON block
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed || !parsed.hook || !parsed.caption) {
      return NextResponse.json({ ...fallback, note: "Fallback used (parse failed)" });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("caption API error", err);
    return NextResponse.json({ ...fallback, note: "Fallback used (API error)" });
  }
}
