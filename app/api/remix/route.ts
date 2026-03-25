import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type RemixSectionResult = {
  hook: string;
  caption: string;
  pinnedComment: string;
  cta: string;
  hashtags: string;
  story: string;
  bestPostTime: string;
  timeReason: string;
  suggestedAudio: string;
  contentType: string;
};

function isPlaceholderKey(apiKey: string | undefined) {
  if (!apiKey) return true;

  const normalized = apiKey.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "<secret>" ||
    normalized === "your_real_key_here" ||
    normalized === "sk-your-real-openai-key" ||
    normalized === "sk-..." ||
    normalized.includes("placeholder")
  );
}

function clampHook(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 10).join(" ");
}

function normalizeHashtags(tags: string[]) {
  const cleaned = tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/\s+/g, "")}`));

  return cleaned.slice(0, 4);
}

function asApiResponse(result: RemixSectionResult) {
  return {
    hook: result.hook,
    caption: result.caption,
    pinnedComment: result.pinnedComment,
    cta: result.cta,
    hashtags: result.hashtags,
    story: result.story,
    bestPostTime: result.bestPostTime,
    timeReason: result.timeReason,
    suggestedAudio: result.suggestedAudio,
    contentType: result.contentType,
    // Legacy aliases to avoid breaking the current page while it migrates.
    pinned_comment: result.pinnedComment,
    story_text: result.story
  };
}

function inferPackaging(input: string) {
  const normalized = input.toLowerCase();

  if (/(science|tech|ai|robot|future|discovery|microscope|space)/.test(normalized)) {
    return {
      bestPostTime: "12:30 PM",
      timeReason: "This fits the midday curiosity slot because it feels mind-opening and easy to save or share.",
      suggestedAudio: "futuristic ambient | cinematic suspense | clean tech pulse",
      contentType: /(breaking|just happened|update|latest|news)/.test(normalized) ? "Breaking" : /(informative|explained|how it works|why it works)/.test(normalized) ? "Informative" : "Curiosity"
    };
  }

  if (/(machine|engineering|cnc|factory|process|cutting|automation|mechanic)/.test(normalized)) {
    return {
      bestPostTime: "6:30 PM",
      timeReason: "This works best in the evening satisfying slot because the visual payoff is clean and rewarding to watch.",
      suggestedAudio: "satisfying machine audio | precision bass pulse | minimal industrial beat",
      contentType: "Satisfying"
    };
  }

  return {
    bestPostTime: "9:15 PM",
    timeReason: "This fits the late replay slot because it feels shocking, intense, and made for repeat views.",
    suggestedAudio: /skill|control|balance|craft|precision hand|athlete/.test(normalized)
      ? "replay-worthy tension beat | dramatic impact build | clean skill pulse"
      : "replay-worthy tension beat | heavy bass edit | dramatic impact build",
    contentType: /skill|control|balance|craft|precision hand|athlete/.test(normalized) ? "Human Skill" : "Replay-worthy"
  };
}

function buildFallback({
  input,
  platform,
  tone,
  vibedMode
}: {
  input: string;
  platform: string;
  tone: string;
  vibedMode: boolean;
}): RemixSectionResult {
  const source = input.trim().split(/\n+/)[0]?.trim() || "this idea";
  const hookBase = vibedMode
    ? `This changes how you see ${source}`
    : `This makes ${source} look completely different`;

  return {
    hook: clampHook(`${hookBase} ${vibedMode ? "👀" : ""}`),
    caption: `${source} hits harder when the setup stays simple. 👀\n\n${platform} rewards clean pacing, stronger contrast, and a clearer payoff. ✨\n\nWould you stop for this version?`,
    pinnedComment: `Would you post the original or this remix?`,
    cta: vibedMode
      ? `Follow @vibed.media for more ideas like this`
      : `Follow for more ${tone} content like this`,
    hashtags: normalizeHashtags([tone, platform, "content", "creator"]).join(" "),
    story: `Hook fast.\nShow the strongest visual first.\nLand the payoff before people swipe.`,
    ...inferPackaging(input)
  };
}

function extractSection(raw: string, labels: string[]) {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:${escaped.join("|")})\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*(?:Hook|Caption|Pinned Comment|PinnedComment|CTA|Hashtags|Story Text|Story)\\s*:?|$)`,
    "i"
  );
  return raw.match(pattern)?.[1]?.trim() ?? "";
}

function parseStructuredResult(outputText: string): RemixSectionResult {
  let parsed: Partial<{
    hook: string;
    caption: string;
    pinned_comment: string;
    pinnedComment: string;
    cta: string;
    hashtags: string[] | string;
    story_text: string;
    story: string;
    bestPostTime: string;
    timeReason: string;
    suggestedAudio: string;
    contentType: string;
  }> | null = null;

  const text = outputText || "";

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      hook: "",
      caption: text,
      pinnedComment: "",
      cta: "",
      hashtags: "",
      story: "",
      ...inferPackaging(text)
    };
  }

  if (parsed) {
    const hashtags = Array.isArray(parsed.hashtags)
      ? normalizeHashtags(parsed.hashtags)
      : normalizeHashtags(String(parsed.hashtags ?? "").split(/\s+/));

    return {
      hook: clampHook(typeof parsed.hook === "string" ? parsed.hook : ""),
      caption: typeof parsed.caption === "string" ? parsed.caption.trim() : "",
      pinnedComment:
        typeof parsed.pinnedComment === "string"
          ? parsed.pinnedComment.trim()
          : typeof parsed.pinned_comment === "string"
            ? parsed.pinned_comment.trim()
            : "",
      cta: typeof parsed.cta === "string" ? parsed.cta.trim() : "",
      hashtags: hashtags.join(" "),
      story:
        typeof parsed.story === "string"
          ? parsed.story.trim()
          : typeof parsed.story_text === "string"
            ? parsed.story_text.trim()
            : "",
      bestPostTime:
        typeof parsed.bestPostTime === "string" ? parsed.bestPostTime.trim() : inferPackaging(text).bestPostTime,
      timeReason:
        typeof parsed.timeReason === "string" ? parsed.timeReason.trim() : inferPackaging(text).timeReason,
      suggestedAudio:
        typeof parsed.suggestedAudio === "string"
          ? parsed.suggestedAudio.trim()
          : inferPackaging(text).suggestedAudio,
      contentType:
        typeof parsed.contentType === "string" ? parsed.contentType.trim() : inferPackaging(text).contentType
    };
  }

  return {
    hook: "",
    caption: text,
    pinnedComment: "",
    cta: "",
    hashtags: "",
    story: "",
    ...inferPackaging(text)
  };
}

function emptyResponse(caption = "Something went wrong. Try again.") {
  return {
    hook: "",
    caption,
    pinnedComment: "",
    cta: "",
    hashtags: "",
    story: "",
    bestPostTime: "",
    timeReason: "",
    suggestedAudio: "",
    contentType: "",
    pinned_comment: "",
    story_text: ""
  };
}

function safeJsonFromText(text: string) {
  let data: RemixSectionResult;

  try {
    data = JSON.parse(text) as RemixSectionResult;
  } catch (e) {
    console.error("JSON PARSE FAILED:", text);
    data = {
      hook: "",
      caption: `⚠️ RAW: ${text || "Something went wrong. Try again."}`,
      pinnedComment: "",
      cta: "",
      hashtags: "",
      story: "",
      ...inferPackaging(text)
    };
  }

  return asApiResponse(parseStructuredResult(JSON.stringify(data)));
}

export async function POST(req: Request) {
  try {
    const {
      input,
      action,
      platform,
      tone,
      outputFormat,
      extraInstructions,
      vibedMode
    } = (await req.json()) as {
      input?: string;
      action?: string;
      platform?: string;
      tone?: string;
      outputFormat?: string;
      extraInstructions?: string;
      vibedMode?: boolean;
    };

    const trimmedInput = input?.trim();
    if (!trimmedInput) {
      return NextResponse.json(emptyResponse("Input is required."), { status: 400 });
    }

    if (isPlaceholderKey(process.env.OPENAI_API_KEY)) {
      return NextResponse.json(
        asApiResponse(
          buildFallback({
            input: trimmedInput,
            platform: platform ?? "Instagram",
            tone: tone ?? "viral",
            vibedMode: Boolean(vibedMode)
          })
        )
      );
    }

    const prompt = `
You are a high-performance short-form content caption writer for social media creators.

Your goal is to generate viral, engaging, creator-ready captions across any niche.

Input:
- Video description

Output:
Return ONLY the final caption with clean line breaks.
No labels. No explanations. No hashtags.

STEP 1: Understand Content
First, internally detect:
- content type (tech, fitness, luxury, satisfying, business, entertainment, etc.)
- emotional angle (curiosity, shock, calm, motivation, etc.)

Adapt tone accordingly.

STRUCTURE

1. Hook
- Strong, scroll-stopping
- Curiosity or emotional pull
- Max 1 emoji
- Avoid:
  “This is”
  “Here is”
  “Watch”
- Make the hook surprising, specific, or contrast-driven
- Avoid generic phrases like:
  “AI is changing everything”
  “This AI works while you sleep”
  “This is amazing”
  “This will blow your mind”
- Prefer unexpected phrasing, curiosity gaps, or strong contrast
- Hook must include at least one of:
  - curiosity gap
  - unexpected comparison
  - time/value contrast
  - feels illegal effect
  - surprising outcome
- Use patterns like:
  - “This should take hours… it takes seconds 🤯”
  - “What this does doesn’t feel real 😳”
  - “This looks fake… but it’s not”
  - “This replaces hours of work instantly”
  - “You’re not supposed to see this”
- Make hooks specific:
  - bad: “AI is powerful”
  - good: “This tool writes a full script in 10 seconds”
- Generate 3 distinct hook options internally, then return only the strongest one
- Each hook option must feel clearly different:
  - no similar wording
  - no repeated structure
- Aim for shocking, intriguing, slightly unbelievable energy

2. Pattern Interrupt
- Add contrast:
“It looks simple… but…”
or similar

3. Simple Explanation
- 1–2 short lines
- Very simple language

4. Tension / Risk
- Show difficulty, danger, or what could go wrong
- Make the tension feel real and immediate

5. Why It Matters
- Why this is impressive, valuable, or important

6. Real-World Connection
- Link to real life or industry

7. Transformation Line
- Format:
“From X → Y”

8. Curiosity Line
- Add intrigue or deeper meaning
- Make the viewer feel like they are missing something important if they skip it

9. Engagement Question
- Simple, comment-driving question

10. Smart CTA
- Adapt CTA based on content:
  - curiosity → “Follow for more hidden insights.”
  - satisfying → “Follow for more satisfying content.”
  - tech → “Follow for simple tech explained.”
  - fitness → “Follow for daily discipline.”
  - general → “Follow for more content like this.”

STYLE RULES
- Keep each line short
- Max 1–2 sentences per line
- Clean spacing between lines
- Use only 1–2 emojis total
- Tone:
  simple
  clean
  slightly dramatic
  easy to skim

VARIATION RULE
- Do NOT repeat the same phrasing every time
- Keep structure consistent, wording fresh
- Each generation should feel distinct, not templated
- Avoid repeating the same hook patterns or sentence openings across outputs

OUTPUT
Return only the caption.

Now transform the user's content into a complete creator-ready short-form package.
You must return ONLY valid JSON. No explanations, no text outside JSON.
No markdown fences. No \`\`\`json. No extra text before or after JSON.
Return ONLY valid JSON with these keys:
{
  "hook": "",
  "caption": "",
  "pinnedComment": "",
  "cta": "",
  "hashtags": "",
  "story": "",
  "bestPostTime": "",
  "timeReason": "",
  "suggestedAudio": "",
  "contentType": ""
}

Additional package rules:
- hook: 6 to 10 words, max 1 tasteful emoji, no generic phrasing, and it must feel specific and impossible to ignore.
- caption: follow the caption system above, keep it easy to skim, and make it feel more emotional, more tense, and more story-driven.
- pinnedComment: one short engagement line.
- cta: adapt naturally to the content.
- hashtags: exactly 3 or 4 simple relevant hashtags.
- story: concise overlay/story text.
- bestPostTime:
  - curiosity / science / tech / informative -> 12:30 PM
  - satisfying / engineering / machines -> 6:30 PM
  - replay-worthy / crazy / shocking / human skill -> 9:15 PM
- timeReason: one short sentence.
- suggestedAudio: 2 to 3 creator-friendly audio vibes separated by " | ".
- contentType must be exactly one of:
  - Curiosity
  - Satisfying
  - Replay-worthy
  - Human Skill
  - Breaking
  - Informative

Context:
- Action: ${action ?? "Rewrite"}
- Platform: ${platform ?? "Instagram"}
- Tone: ${tone ?? "viral"}
- Output format preference: ${outputFormat ?? "Full post"}
- Vibed Mode: ${vibedMode ? "On" : "Off"}
- Extra instructions: ${extraInstructions?.trim() || "None"}

User content:
${trimmedInput}
`.trim();

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    const text = response.output_text || "";
    console.error("FULL RESPONSE:", JSON.stringify(response, null, 2));
    console.error("RAW OUTPUT TEXT:", text);
    const data = safeJsonFromText(text);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(emptyResponse());
  }
}
