import { Badge } from "@/components/ui/badge";
import { BrandRulesEditor } from "@/components/vibed/brand-rules-editor";
import { getBrandRules } from "@/lib/vibed-hunter-data";

export default function BrandRulesPage() {
  const rules = getBrandRules();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Brand Rules Panel</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Permanent constraints for how Vibed Hunter thinks and writes.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          These rules keep the system opinionated: premium viral tone, US-first readability, short clean hooks, skimmable captions, and safer rewrites.
        </p>
      </section>
      <BrandRulesEditor rules={rules} />
    </div>
  );
}
