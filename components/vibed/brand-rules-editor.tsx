import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BrandRules } from "@/lib/vibed-hunter-data";

export function BrandRulesEditor({ rules }: { rules: BrandRules }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle>Default Vibed rules</CardTitle>
        <CardDescription className="mt-2">Permanent brand constraints for tone, hooks, captions, and safety.</CardDescription>
        <div className="mt-4 grid gap-3 text-sm">
          <div><span className="text-muted-foreground">Tone:</span> {rules.preferredTone}</div>
          <div><span className="text-muted-foreground">Audience:</span> {rules.targetAudience}</div>
          <div><span className="text-muted-foreground">CTA style:</span> {rules.ctaStyle}</div>
          <div><span className="text-muted-foreground">Hashtag style:</span> {rules.hashtagStyle}</div>
          <div><span className="text-muted-foreground">Safety strictness:</span> {rules.safetyStrictness}</div>
        </div>
      </Card>
      <Card>
        <CardTitle>Avoid list</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {rules.bannedPhrases.map((phrase) => <Badge key={phrase}>{phrase}</Badge>)}
        </div>
        <CardTitle className="mt-6">Cover rules</CardTitle>
        <div className="mt-4 grid gap-2">
          {rules.coverStyleRules.map((rule) => <div key={rule} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">{rule}</div>)}
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <CardTitle>Content pillars</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {rules.contentPillars.map((pillar) => (
            <div key={pillar.slot} className="rounded-2xl bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">{pillar.slot}</p>
              <p className="mt-2 font-semibold">{pillar.pillar}</p>
              <p className="mt-2 text-sm text-muted-foreground">{pillar.focus}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
