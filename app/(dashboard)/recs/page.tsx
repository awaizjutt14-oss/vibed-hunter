import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDailyRecSlots, getWarnings, getTopicSuggestions, getExamplePatterns, getExamples } from "@/lib/vibed-examples-data";
import { ExampleUploader } from "@/components/vibed/example-uploader";

export default function RecsPage() {
  const slots = getDailyRecSlots();
  const warnings = getWarnings();
  const suggestions = getTopicSuggestions();
  const patterns = getExamplePatterns();
  const examples = getExamples();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Today’s Picks</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Three picks. Post fast.</h1>
        <p className="mt-2 text-muted-foreground">We studied your examples and serve only what matches your taste.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {slots.map((slot) => (
          <Card key={slot.slot} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge>{slot.slot}</Badge>
              <Badge className="bg-primary/10 text-primary">Fit</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{slot.videoType}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-primary">Topics</p>
            <ul className="text-sm text-foreground space-y-1">
              {slot.topics.map((t) => <li key={t}>• {t}</li>)}
            </ul>
            <p className="text-xs uppercase tracking-[0.14em] text-primary">Hook direction</p>
            <p className="text-sm">{slot.hookDirection}</p>
            <p className="text-xs text-muted-foreground">Why: {slot.why}</p>
            <p className="text-xs text-muted-foreground">Avoid: {slot.avoid.join(", ")}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5 space-y-3">
        <p className="text-sm font-semibold">What not to post today</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {warnings.repetition.map((w) => <li key={w}>• {w}</li>)}
          {warnings.badFit.map((w) => <li key={w}>• {w}</li>)}
          {warnings.weakFirstFrame.map((w) => <li key={w}>• {w}</li>)}
          {warnings.overusedHooks.map((w) => <li key={w}>• {w}</li>)}
          {warnings.rejectedExamples.map((w) => <li key={w}>• skip: {w}</li>)}
        </ul>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Topic suggestions in your style</p>
          <Badge>Fresh</Badge>
        </div>
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Hooks</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.hooks.map((h) => <span key={h} className="rounded-full bg-muted px-3 py-1 text-sm">{h}</span>)}
        </div>
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Topics</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.topics.map((h) => <span key={h} className="rounded-full bg-muted px-3 py-1 text-sm">{h}</span>)}
        </div>
      </Card>

      <Card className="p-5 space-y-2">
        <p className="text-sm font-semibold">Your taste so far</p>
        <p className="text-sm text-muted-foreground">Visual: {patterns.visualStyle}. Hook: {patterns.hookStyle}. Premium: {patterns.premium}. Generic: {patterns.generic}.</p>
        <p className="text-xs text-muted-foreground">You keep liking: {patterns.likedTypes.join(", ")}.</p>
        <p className="text-xs text-muted-foreground">You keep rejecting: {patterns.rejectedTypes.join(", ")}.</p>
      </Card>

      <ExampleUploader existing={examples} />
    </div>
  );
}
