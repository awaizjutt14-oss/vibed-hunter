import { NextResponse } from "next/server";
import OpenAI from "openai";
import { recordSuccessfulGeneration, requireGenerationAccess } from "@/lib/generation-access";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type HuntIdea = {
  time: string;
  category: string;
  idea: string;
  hook: string;
  caption: string;
  whyItCouldWork: string;
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

function fallbackIdeas(): HuntIdea[] {
  return [
    {
      time: "12:30 PM",
      category: "Curiosity / Tech",
      idea: "A tiny robot or microscope visual that looks unreal at first glance.",
      hook: "This looks fake until you zoom in",
      caption:
        "The first second feels impossible.\n\nThen the detail starts to make sense, and that is what keeps people watching.\n\nWould you stop for this?",
      whyItCouldWork: "It opens a curiosity gap fast and makes people replay for the hidden detail."
    },
    {
      time: "6:30 PM",
      category: "Satisfying / Engineering",
      idea: "A machine process with clean precision and an obvious visual payoff.",
      hook: "Wait for the final cut on this",
      caption:
        "Every movement feels too precise to be real.\n\nThe payoff is clean, fast, and weirdly satisfying to watch again.\n\nWould you replay this ending?",
      whyItCouldWork: "The visual payoff is immediate, clean, and easy to watch more than once."
    },
    {
      time: "9:15 PM",
      category: "Crazy / Human Skill",
      idea: "A human control clip so precise it makes people question if it is real.",
      hook: "How is this level of control real",
      caption:
        "It looks impossible on the first watch.\n\nThen you replay it just to figure out how they did it.\n\nWould you believe this without the replay?",
      whyItCouldWork: "It feels shocking on first watch and replay-worthy once people try to decode it."
    }
  ];
}

function normalizeIdeas(raw: unknown): HuntIdea[] {
  if (!Array.isArray(raw)) {
    return fallbackIdeas();
  }

  const ideas = raw
    .map((item) => {
      const entry = item as Partial<HuntIdea>;
      return {
        time: typeof entry.time === "string" ? entry.time.trim() : "",
        category: typeof entry.category === "string" ? entry.category.trim() : "",
        idea: typeof entry.idea === "string" ? entry.idea.trim() : "",
        hook: typeof entry.hook === "string" ? entry.hook.trim() : "",
        caption: typeof entry.caption === "string" ? entry.caption.trim() : "",
        whyItCouldWork:
          typeof entry.whyItCouldWork === "string" ? entry.whyItCouldWork.trim() : ""
      };
    })
    .filter(
      (item) =>
        item.time &&
        item.category &&
        item.idea &&
        item.hook &&
        item.caption &&
        item.whyItCouldWork
    );

  return ideas.length === 3 ? ideas : fallbackIdeas();
}

export async function GET(request: Request) {
  let access: Awaited<ReturnType<typeof requireGenerationAccess>> | null = null;
  const usageEventId = new URL(request.url).searchParams.get("usageEventId")?.trim() || undefined;

  try {
    access = await requireGenerationAccess("hunt");
    if (!access.allowed) {
      return NextResponse.json(access.body, { status: access.status });
    }

    if (isPlaceholderKey(process.env.OPENAI_API_KEY)) {
      const trial = await recordSuccessfulGeneration({
        actor: access.actor,
        usage: access.usage,
        action: "hunt",
        usageEventId
      });
      return NextResponse.json({ posts: fallbackIdeas(), ...trial });
    }

    const prompt = `
You are Content Hunter Brain for Vibed Media.

Generate exactly 3 short-form content ideas for a US audience.

Return ONLY valid JSON with this exact shape:
{
  "posts": [
    {
      "time": "",
      "category": "",
      "idea": "",
      "hook": "",
      "caption": "",
      "whyItCouldWork": ""
    }
  ]
}

Rules:
- Idea 1 must be for 12:30 PM — Curiosity / Tech / Science
- Idea 2 must be for 6:30 PM — Satisfying / Engineering / Machines
- Idea 3 must be for 9:15 PM — Crazy Human Skill / Replay-worthy / Impossible control
- Hooks must be 8 to 10 words
- Style must match Vibed Media
- Make each idea highly visual, engaging, and viral
- Focus on tech, science, engineering, and human skill
- Keep captions short, warm, and easy to skim
- Add a one-sentence whyItCouldWork for each post
- 12:30 should feel mind-opening
- 6:30 should feel visually satisfying
- 9:15 should feel shocking or impossible
- No markdown fences
- No extra text outside JSON
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
    let data: { posts?: unknown };

    try {
      data = JSON.parse(text) as { posts?: unknown };
    } catch {
      const trial = await recordSuccessfulGeneration({
        actor: access.actor,
        usage: access.usage,
        action: "hunt",
        usageEventId
      });
      return NextResponse.json({ posts: fallbackIdeas(), ...trial });
    }

    const trial = await recordSuccessfulGeneration({
      actor: access.actor,
      usage: access.usage,
      action: "hunt",
      usageEventId
    });
    return NextResponse.json({ posts: normalizeIdeas(data.posts), ...trial });
  } catch {
    if (access?.allowed) {
      const trial = await recordSuccessfulGeneration({
        actor: access.actor,
        usage: access.usage,
        action: "hunt",
        usageEventId
      });
      return NextResponse.json({ posts: fallbackIdeas(), ...trial });
    }
    return NextResponse.json({ posts: fallbackIdeas() });
  }
}
