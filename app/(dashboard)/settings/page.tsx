import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getBrandRules } from "@/lib/vibed-hunter-data";
import { LearningSettings } from "@/components/vibed/learning-settings";

export default function SettingsPage() {
  const rules = getBrandRules();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Settings</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Brand preferences, scoring weights, safety, and UI controls.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          This prototype keeps settings opinionated around Vibed Media while staying modular for future API connectors and real persistence.
        </p>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Brand preferences</CardTitle>
          <CardDescription className="mt-2">Preferred tone, CTA style, hashtag style, target audience, and posting schedule.</CardDescription>
          <div className="mt-4 grid gap-3 text-sm">
            <div>Tone: {rules.preferredTone}</div>
            <div>Audience: {rules.targetAudience}</div>
            <div>CTA style: {rules.ctaStyle}</div>
            <div>Hashtag style: {rules.hashtagStyle}</div>
          </div>
        </Card>
        <Card>
          <CardTitle>Engine controls</CardTitle>
          <CardDescription className="mt-2">Scoring weights, duplicate detection, region targeting, and safety sensitivity.</CardDescription>
          <div className="mt-4 grid gap-3 text-sm">
            <div>US-first filter: enabled</div>
            <div>Duplicate detection strictness: medium-high</div>
            <div>High repost safety only: optional</div>
            <div>UI density: comfortable</div>
          </div>
        </Card>
        <Card>
          <CardTitle>Source connectors</CardTitle>
          <CardDescription className="mt-2">Visual-first public metadata stack prepared for future live APIs.</CardDescription>
          <div className="mt-4 grid gap-2 text-sm">
            <div>ScienceDaily AI</div>
            <div>ScienceDaily Engineering</div>
            <div>NASA Breaking News</div>
            <div>Reddit visual discovery presets</div>
          </div>
        </Card>
        <Card>
          <CardTitle>Notifications</CardTitle>
          <CardDescription className="mt-2">Daily digest, planner completion, pack ready state, and saved-library reminders.</CardDescription>
          <div className="mt-4 grid gap-3 text-sm">
            <div>Daily digest: enabled</div>
            <div>Pack ready alerts: enabled</div>
            <div>Planner reminders: enabled</div>
          </div>
        </Card>
        <LearningSettings />
      </div>
    </div>
  );
}
