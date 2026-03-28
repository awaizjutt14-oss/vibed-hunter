import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSuccessfulGenerationTrial, requireGenerationAccess } from "@/lib/generation-access";
import { fetchRecentGenerationHistory, saveCarouselDraftToDatabase, saveGenerationToDatabase } from "@/lib/supabase/user-store";

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
  internalScores: {
    hookStrength: number;
    curiosity: number;
    clarity: number;
    virality: number;
    nicheMatch: number;
  };
};

type CarouselFormat = "Breaking News" | "Story / Explainer" | "List / Utility";

type CarouselSlide = {
  slide_number: number;
  headline: string;
  body_text: string;
  highlight_words: string[];
  visual_direction: string;
};

type CarouselPayload = {
  post_type: string;
  total_slides: number;
  cover_headline: string;
  cover_subheadline?: string;
  slides: CarouselSlide[];
  final_cta: string;
};

type RemixOutput = RemixSectionResult & Partial<CarouselPayload>;

type GenerationHistoryDebug = {
  generationHistorySaved?: boolean;
  generationHistoryError?: {
    reason: "missing_client" | "table_unavailable" | "insert_failed" | "missing_fields";
    details?: {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
  };
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

function clampBody(text: string, maxWords = 20) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join(" ");
}

function normalizeSlide(raw: Partial<CarouselSlide>, slideNumber: number): CarouselSlide {
  const headline = clampBody(String(raw.headline ?? `Slide ${slideNumber}`), 8);
  const body_text = clampBody(String(raw.body_text ?? ""), 22);
  const visual_direction = clampBody(String(raw.visual_direction ?? "Clean visual showing the main idea clearly."), 18);
  const highlight_words = Array.isArray(raw.highlight_words)
    ? raw.highlight_words.map((item) => String(item).trim()).filter(Boolean).slice(0, 4)
    : headline
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

  return {
    slide_number: slideNumber,
    headline,
    body_text,
    highlight_words,
    visual_direction
  };
}

function buildCarouselFallback(input: string, format: CarouselFormat): CarouselPayload {
  const seed = input.trim().split(/\n+/)[0]?.trim() || "This topic";

  if (format === "Breaking News") {
    const slides = [
      normalizeSlide(
        {
          headline: `${seed} just shifted fast`,
          body_text: "Lead with the biggest development in the clearest possible words.",
          highlight_words: ["shifted", "fast"],
          visual_direction: "Bold cover with urgent headline and one strong visual from the story."
        },
        1
      ),
      normalizeSlide(
        {
          headline: "What happened first",
          body_text: "Give the most important fact people need immediately.",
          highlight_words: ["important", "fact"],
          visual_direction: "Use a cropped visual detail or screenshot with minimal annotation."
        },
        2
      ),
      normalizeSlide(
        {
          headline: "What changes now",
          body_text: "Explain the impact in simple language people can understand fast.",
          highlight_words: ["changes", "now"],
          visual_direction: "Pair short text with a visual showing before versus after."
        },
        3
      ),
      normalizeSlide(
        {
          headline: "Why it matters",
          body_text: "Land the takeaway with a clear consequence or future implication.",
          highlight_words: ["why", "matters"],
          visual_direction: "Use a cleaner final slide with a strong summary line."
        },
        4
      )
    ];

    return {
      post_type: format,
      total_slides: slides.length,
      cover_headline: clampHook(`${seed} is changing faster than expected`),
      cover_subheadline: "Fast update for the people who need the signal early.",
      slides,
      final_cta: "Follow for sharper tech and business updates."
    };
  }

  if (format === "Story / Explainer") {
    const slides = [
      normalizeSlide(
        {
          headline: `Why ${seed} feels unreal`,
          body_text: "Open with the tension, not the explanation.",
          highlight_words: ["feels", "unreal"],
          visual_direction: "Use the most dramatic or strange visual first."
        },
        1
      ),
      normalizeSlide(
        {
          headline: "The detail people miss",
          body_text: "Introduce the first surprising fact in simple language.",
          highlight_words: ["detail", "miss"],
          visual_direction: "Zoom into one part of the scene or mechanism."
        },
        2
      ),
      normalizeSlide(
        {
          headline: "This is where it changes",
          body_text: "Escalate the story with a stronger reveal or turning point.",
          highlight_words: ["changes", "reveal"],
          visual_direction: "Shift to a more dramatic angle or motion moment."
        },
        3
      ),
      normalizeSlide(
        {
          headline: "What it actually means",
          body_text: "Land the takeaway in one line people can remember.",
          highlight_words: ["actually", "means"],
          visual_direction: "Minimal final frame with one clean statement."
        },
        4
      )
    ];

    return {
      post_type: format,
      total_slides: slides.length,
      cover_headline: clampHook(`${seed} looks simple until you notice this`),
      cover_subheadline: "One escalating reveal per slide.",
      slides,
      final_cta: "Follow for more stories that feel impossible at first."
    };
  }

  const slides = [
    normalizeSlide(
      {
        headline: `Ways ${seed} gets better`,
        body_text: "Start with a save-worthy list hook that feels useful immediately.",
        highlight_words: ["ways", "better"],
        visual_direction: "Bright cover text over a strong object or lifestyle visual."
      },
      1
    ),
    normalizeSlide(
      {
        headline: "Tip 1",
        body_text: "One clean practical point per slide.",
        highlight_words: ["tip", "one"],
        visual_direction: "Minimal text with one simple supporting visual."
      },
      2
    ),
    normalizeSlide(
      {
        headline: "Tip 2",
        body_text: "Keep it fast, useful, and easy to save.",
        highlight_words: ["fast", "save"],
        visual_direction: "Use a second close-up, screen, or product detail."
      },
      3
    ),
    normalizeSlide(
      {
        headline: "Final takeaway",
        body_text: "End with the strongest useful line and a reason to revisit the post.",
        highlight_words: ["final", "takeaway"],
        visual_direction: "Simple wrap-up slide with high-contrast text."
      },
      4
    )
  ];

  return {
    post_type: format,
    total_slides: slides.length,
    cover_headline: clampHook(`${seed} made much simpler to understand`),
    cover_subheadline: "Fast, useful, and built to be saved.",
    slides,
    final_cta: "Follow for more save-worthy creator carousels."
  };
}

function normalizeCarouselPayload(raw: Partial<CarouselPayload>, format: CarouselFormat, input: string): CarouselPayload {
  const fallback = buildCarouselFallback(input, format);
  const slides = Array.isArray(raw.slides) && raw.slides.length
    ? raw.slides.map((slide, index) => normalizeSlide(slide, index + 1))
    : fallback.slides;

  return {
    post_type: typeof raw.post_type === "string" ? raw.post_type.trim() || format : format,
    total_slides: slides.length,
    cover_headline:
      typeof raw.cover_headline === "string" && raw.cover_headline.trim()
        ? clampBody(raw.cover_headline, 10)
        : fallback.cover_headline,
    cover_subheadline:
      typeof raw.cover_subheadline === "string" && raw.cover_subheadline.trim()
        ? clampBody(raw.cover_subheadline, 18)
        : fallback.cover_subheadline,
    slides,
    final_cta:
      typeof raw.final_cta === "string" && raw.final_cta.trim() ? raw.final_cta.trim() : fallback.final_cta
  };
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
    internalScores: result.internalScores,
    // Legacy aliases to avoid breaking the current page while it migrates.
    pinned_comment: result.pinnedComment,
    story_text: result.story
  } satisfies Record<string, unknown>;
}
type RemixApiResponse = ReturnType<typeof asApiResponse> &
  Partial<CarouselPayload> &
  GenerationHistoryDebug & {
    carouselDraftSaved?: boolean;
    carouselDraftError?: {
      reason: "missing_client" | "table_unavailable" | "insert_failed" | "missing_fields";
      details?: {
        message?: string;
        code?: string;
        details?: string;
        hint?: string;
      };
    };
  };

function scorePackage(input: string, result: Partial<RemixSectionResult>) {
  const text = `${input} ${result.hook ?? ""} ${result.caption ?? ""}`.toLowerCase();
  const hookStrength = Math.min(100, 55 + (result.hook?.length ?? 0));
  const curiosity = /(how|why|what|fake|illegal|supposed|secret|instantly|hours|seconds)/.test(text) ? 88 : 72;
  const clarity = (result.caption?.split(/\s+/).length ?? 0) <= 120 ? 90 : 70;
  const virality = Math.round((hookStrength + curiosity + clarity) / 3);
  const nicheMatch = /(tech|fitness|luxury|satisfying|business|fashion|science|engineering|story)/.test(text) ? 86 : 74;

  return { hookStrength, curiosity, clarity, virality, nicheMatch };
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
    ...inferPackaging(input),
    internalScores: scorePackage(input, { hook: hookBase, caption: source })
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

function parseStructuredResult(outputText: string, format?: CarouselFormat, input?: string): RemixOutput {
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
    internalScores: RemixSectionResult["internalScores"];
  }> | null = null;

  const text = outputText || "";

  try {
    parsed = JSON.parse(text);
  } catch {
    const base = {
      hook: "",
      caption: text,
      pinnedComment: "",
      cta: "",
      hashtags: "",
      story: "",
      ...inferPackaging(text),
      internalScores: scorePackage(text, { caption: text })
    };

    return format && input ? { ...base, ...buildCarouselFallback(input, format) } : base;
  }

  if (parsed) {
    const hashtags = Array.isArray(parsed.hashtags)
      ? normalizeHashtags(parsed.hashtags)
      : normalizeHashtags(String(parsed.hashtags ?? "").split(/\s+/));

    const base = {
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
        typeof parsed.contentType === "string" ? parsed.contentType.trim() : inferPackaging(text).contentType,
      internalScores:
        parsed.internalScores && typeof parsed.internalScores === "object"
          ? (parsed.internalScores as RemixSectionResult["internalScores"])
          : scorePackage(text, {
              hook: typeof parsed.hook === "string" ? parsed.hook : "",
              caption: typeof parsed.caption === "string" ? parsed.caption : ""
            })
    };

    return format && input ? { ...base, ...normalizeCarouselPayload(parsed as Partial<CarouselPayload>, format, input) } : base;
  }

  const base = {
    hook: "",
    caption: text,
    pinnedComment: "",
    cta: "",
    hashtags: "",
    story: "",
    ...inferPackaging(text),
    internalScores: scorePackage(text, { caption: text })
  };

  return format && input ? { ...base, ...buildCarouselFallback(input, format) } : base;
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
    internalScores: {
      hookStrength: 0,
      curiosity: 0,
      clarity: 0,
      virality: 0,
      nicheMatch: 0
    },
    pinned_comment: "",
    story_text: ""
  };
}

function safeJsonFromText(text: string, format?: CarouselFormat, input?: string) {
  let data: RemixOutput;

  try {
    data = JSON.parse(text) as RemixOutput;
  } catch (e) {
    console.error("JSON PARSE FAILED:", text);
    const base = {
      hook: "",
      caption: `⚠️ RAW: ${text || "Something went wrong. Try again."}`,
      pinnedComment: "",
      cta: "",
      hashtags: "",
      story: "",
      ...inferPackaging(text),
      internalScores: scorePackage(text, { caption: text })
    };
    data = format && input ? { ...base, ...buildCarouselFallback(input, format) } : base;
  }

  const structured = parseStructuredResult(JSON.stringify(data), format, input);
  return {
    ...asApiResponse(structured),
    ...(format && input ? normalizeCarouselPayload(structured, format, input) : {})
  };
}

function buildHistoryContext(
  history: Array<{
    input: string;
    hook: string;
    caption: string;
    created_at?: string;
  }>
) {
  if (!history.length) {
    return "";
  }

  return [
    "Previous examples:",
    ...history.map(
      (item, index) =>
        `${index + 1}. Input: ${item.input}\n   Hook: ${item.hook}`
    ),
    "Match tone, structure, and hook style based on previous examples."
  ].join("\n");
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
      vibedMode,
      learningProfile,
      contentFormat
    } = (await req.json()) as {
      input?: string;
      action?: string;
      platform?: string;
      tone?: string;
      outputFormat?: string;
      extraInstructions?: string;
      vibedMode?: boolean;
      learningProfile?: string;
      contentFormat?: CarouselFormat;
    };

    const trimmedInput = input?.trim();
    if (!trimmedInput) {
      return NextResponse.json(emptyResponse("Input is required."), { status: 400 });
    }

    if (!contentFormat) {
      return NextResponse.json(emptyResponse("Select a content format to build a carousel."), { status: 400 });
    }

    const access = await requireGenerationAccess("remix");
    if (!access.allowed) {
      return NextResponse.json(access.body, { status: access.status });
    }

    const history = await fetchRecentGenerationHistory(access.userEmail).catch(() => []);

    if (isPlaceholderKey(process.env.OPENAI_API_KEY)) {
      const fallback: RemixApiResponse = asApiResponse(
        buildFallback({
          input: trimmedInput,
          platform: platform ?? "Instagram",
          tone: tone ?? "viral",
          vibedMode: Boolean(vibedMode)
        })
      );
      Object.assign(fallback, buildCarouselFallback(trimmedInput, contentFormat));
      const saveResult = await saveGenerationToDatabase({
        userEmail: access.userEmail,
        input: trimmedInput,
        hook: fallback.hook,
        caption: fallback.caption
      }).catch(() => null);
      const carouselSave = await saveCarouselDraftToDatabase({
        userEmail: access.userEmail,
        format: contentFormat,
        input: trimmedInput,
        coverHeadline: fallback.cover_headline ?? "",
        coverSubheadline: fallback.cover_subheadline,
        slides: fallback.slides ?? [],
        caption: fallback.caption,
        finalCta: fallback.final_cta ?? fallback.cta
      }).catch(() => null);
      if (saveResult) {
        fallback.generationHistorySaved = saveResult.ok;
        if (!saveResult.ok) {
          fallback.generationHistoryError = {
            reason: saveResult.reason,
            details: "error" in saveResult ? saveResult.error : undefined
          };
        }
      }
      if (carouselSave) {
        fallback.carouselDraftSaved = carouselSave.ok;
        if (!carouselSave.ok) {
          fallback.carouselDraftError = {
            reason: carouselSave.reason,
            details: "error" in carouselSave ? carouselSave.error : undefined
          };
        }
      }
      const trial = buildSuccessfulGenerationTrial({
        freePostsUsed: access.freePostsUsed,
        isPaid: access.isPaid,
        generationSaved: saveResult?.ok
      });
      console.info("Remix generation success.", { userEmail: access.userEmail, mode: "fallback" });
      return NextResponse.json({ ...fallback, ...trial });
    }

    const prompt = `
You are a high-performance short-form content caption writer for social media creators.

Your goal is to generate viral, engaging, creator-ready captions across any niche.

${buildHistoryContext(history)}

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
- 6 to 10 words max
- Avoid:
  “This is”
  “Here is”
  “Watch”
- Make the hook surprising, specific, or contrast-driven
- Make the hook feel unexpected and outcome-driven
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
- The final hook should feel like something Pubity, UNILAD, or Vibed Media would actually post

2. Pattern Interrupt
- Add contrast:
“It looks simple… but…”
or similar

3. Simple Explanation
- 1–2 short lines
- Very simple language
- Keep a fast rhythm and remove filler

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
- Add one clear curiosity gap before the CTA

9. Engagement Question
- Simple, comment-driving question

10. Smart CTA
- Adapt CTA based on content:
  - curiosity → “Follow for more hidden insights.”
  - satisfying → “Follow for more satisfying content.”
  - tech → “Follow for simple tech explained.”
  - fitness → “Follow for daily discipline.”
  - general → “Follow for more content like this.”
- CTA must match the topic and feel short, natural, and non-generic

STYLE RULES
- Keep each line short
- Max 1–2 sentences per line
- Keep paragraphs to 1–2 lines max
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

Also include a carousel package in the same JSON with these keys:
{
  "post_type": "",
  "total_slides": 0,
  "cover_headline": "",
  "cover_subheadline": "",
  "slides": [
    {
      "slide_number": 1,
      "headline": "",
      "body_text": "",
      "highlight_words": [],
      "visual_direction": ""
    }
  ],
  "final_cta": ""
}

Carousel rules:
- Selected format: ${contentFormat}
- The carousel must feel like a premium Instagram media carousel.
- Keep one idea per slide.
- body_text must be short and skimmable, never verbose.
- highlight_words should be 2 to 4 words worth emphasizing in design.
- visual_direction should tell a designer what clip, frame, screenshot, or visual treatment fits the slide.

Breaking News:
- 4 to 6 slides
- Slide 1: major headline / biggest development
- Slide 2: most important fact
- Slide 3: second important fact
- Slide 4: what changes / impact
- Slide 5 optional: why it matters
- Final slide optional: CTA
- Tone: direct, high-impact, media-page style

Story / Explainer:
- 5 to 7 slides
- Slide 1: strong hook
- Slides 2 to 5: one escalating fact per slide
- Slide 6 optional: biggest reveal / takeaway
- Final slide optional: CTA
- Tone: curiosity-driven, narrative, surprising

List / Utility:
- 6 to 8 slides
- Slide 1: list hook
- Slides 2 to 7: one tip or fact per slide
- Final slide: CTA
- Tone: useful, fast, save-worthy, simple

Additional package rules:
- hook: 6 to 10 words, max 1 tasteful emoji, no generic phrasing, high curiosity, strong outcome, and it must feel unexpected.
- caption: follow the caption system above, keep it easy to skim, use short punchy lines, remove filler sentences, add one curiosity gap, and end with an engagement question.
- pinnedComment: one short engagement line.
- cta: adapt naturally to the topic, keep it short, and avoid generic wording.
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

Learned user preference summary:
${learningProfile?.trim() || "No learned preferences yet."}

Context:
- Action: ${action ?? "Rewrite"}
- Platform: ${platform ?? "Instagram"}
- Tone: ${tone ?? "viral"}
- Output format preference: ${outputFormat ?? "Full post"}
- Vibed Mode: ${vibedMode ? "On" : "Off"}
- Content format: ${contentFormat}
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
    const data: RemixApiResponse = safeJsonFromText(text, contentFormat, trimmedInput);
    const saveResult = await saveGenerationToDatabase({
      userEmail: access.userEmail,
      input: trimmedInput,
      hook: typeof data.hook === "string" ? data.hook : "",
      caption: typeof data.caption === "string" ? data.caption : ""
    }).catch(() => null);
    const carouselSave = await saveCarouselDraftToDatabase({
      userEmail: access.userEmail,
      format: contentFormat,
      input: trimmedInput,
      coverHeadline: typeof data.cover_headline === "string" ? data.cover_headline : "",
      coverSubheadline: typeof data.cover_subheadline === "string" ? data.cover_subheadline : undefined,
      slides: Array.isArray(data.slides) ? data.slides : [],
      caption: typeof data.caption === "string" ? data.caption : "",
      finalCta:
        typeof data.final_cta === "string"
          ? data.final_cta
          : typeof data.cta === "string"
            ? data.cta
            : ""
    }).catch(() => null);
    if (saveResult) {
      data.generationHistorySaved = saveResult.ok;
      if (!saveResult.ok) {
        data.generationHistoryError = {
          reason: saveResult.reason,
          details: "error" in saveResult ? saveResult.error : undefined
        };
      }
    }
    if (carouselSave) {
      data.carouselDraftSaved = carouselSave.ok;
      if (!carouselSave.ok) {
        data.carouselDraftError = {
          reason: carouselSave.reason,
          details: "error" in carouselSave ? carouselSave.error : undefined
        };
      }
    }
    const trial = buildSuccessfulGenerationTrial({
      freePostsUsed: access.freePostsUsed,
      isPaid: access.isPaid,
      generationSaved: saveResult?.ok
    });
    console.info("Remix generation success.", { userEmail: access.userEmail, mode: "openai" });
    return NextResponse.json({ ...data, ...trial });
  } catch (error: any) {
    console.error("Remix generation error.", error);
    return NextResponse.json(emptyResponse());
  }
}
