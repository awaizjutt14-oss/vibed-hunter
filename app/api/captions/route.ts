import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReqBody = {
  topic?: string;
  platform?: "instagram" | "tiktok" | "youtube";
  contentType?: string;
};

const fallback = {
  hook: "This machine looks fake until it cuts",
  caption:
    "It looks too clean to be real.\nThen you realize one tiny mistake ruins the whole thing.\nWould you watch this twice?",
  pinned_comment: "Would you trust a machine this precise?",
  hashtags: ["#engineering", "#precision", "#machines", "#satisfying"]
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
  if (!hasUsableOpenAIKey(apiKey)) {
    // No key in env; return a safe fallback so the app works in demo mode
    return NextResponse.json({ ...fallback, note: "Using demo fallback (missing or placeholder OPENAI_API_KEY)" });
  }

  const client = new OpenAI({ apiKey });

  const prompt = `You are Vibed Media's viral caption engine for short-form (Reels/TikTok/Shorts).
Follow this structure exactly and output JSON:
{
  "hook": "6-10 word hook",
  "caption": "multi-line caption",
  "pinned_comment": "one short engaging line",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"]
}

Rules:
1) HOOK:
- 6 to 10 words only
- strong curiosity or disbelief
- clean, simple language
- feel like a thought, not a title
- avoid formal tone

2) CAPTION:
- 2 to 3 short lines max
- easy to read
- no long paragraphs
- slight mystery tone
- natural, emotional, scroll-stopping
- end with a question
- do not use robotic phrases like "this works because"

3) PINNED COMMENT:
- one short line only

4) HASHTAGS:
- 3 to 4 simple relevant hashtags
- no spam

Style reference: Pubity, UNILAD, Vibed Media.
Platform mode: ${platform}. TikTok = shorter and punchier. YouTube = slightly more informative. Instagram = full clean version.
Content focus: ${contentType}.
Topic: ${topic}.
Style: clean, modern, minimal; human, simple, slightly mysterious; no emojis; no robotic wording.
Return JSON only.`;

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

    return NextResponse.json(normalizeOutput(parsed));
  } catch (err) {
    console.error("caption API error", err);
    return NextResponse.json({ ...fallback, note: "Fallback used (API error)" });
  }
}

function hasUsableOpenAIKey(value: string | undefined) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed === "<SECRET>") return false;
  if (trimmed.includes("your-real-openai-key")) return false;
  if (trimmed.includes("your_real_key_here")) return false;
  return true;
}

function normalizeOutput(parsed: unknown) {
  const data = (parsed ?? {}) as {
    hook?: unknown;
    caption?: unknown;
    pinned_comment?: unknown;
    hashtags?: unknown;
  };

  const hook = normalizeHook(data.hook);
  const caption = normalizeCaption(data.caption);
  const pinned_comment = normalizePinnedComment(data.pinned_comment);
  const hashtags = normalizeHashtags(data.hashtags);

  if (!hook || !caption || !pinned_comment || hashtags.length < 3) {
    return fallback;
  }

  return { hook, caption, pinned_comment, hashtags };
}

function normalizeHook(value: unknown) {
  const hook = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!hook) return "";
  return hook.split(" ").slice(0, 10).join(" ");
}

function normalizeCaption(value: unknown) {
  const lines = String(value ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!lines.length) return "";
  const lastLine = lines[lines.length - 1];
  if (!lastLine.endsWith("?")) {
    lines[lines.length - 1] = `${lastLine.replace(/[.!]+$/, "")}?`;
  }
  return lines.join("\n");
}

function normalizePinnedComment(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
}

function normalizeHashtags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => String(tag).trim().toLowerCase())
    .filter((tag) => tag.startsWith("#"))
    .slice(0, 4);
}
