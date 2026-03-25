import Link from "next/link";
import { ArrowUpRight, Bookmark, Sparkles, ShieldCheck, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type OpportunityCardProps = {
  id: string;
  packetId?: string | null;
  hook: string;
  vibedScore: number;
  whyFits: string;
  sourceCount: number;
  platformFit: string;
  publishUrgency: string;
  visualStrength: number;
  repostSafety: number;
  bestSlot: string;
  visualExplanation: string;
  shortFormReason?: string;
  ctaLabel?: string;
};

export function OpportunityCard(props: OpportunityCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
      <div className="mb-4 flex items-center justify-between">
        <Badge>{props.platformFit}</Badge>
        <Badge className="bg-accent text-accent-foreground">Vibed Score {props.vibedScore}</Badge>
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Hook</p>
      <CardTitle className="mt-2">{props.hook}</CardTitle>
      <CardDescription className="mt-3">{props.whyFits}</CardDescription>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{props.sourceCount} sources</span>
        <span>{props.publishUrgency} urgency</span>
        <span>{props.bestSlot}</span>
        <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />short-form ready</span>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground">
        <div className="flex items-start justify-between gap-3">
          <span>Why it fits</span>
          <span className="max-w-[68%] text-right">{props.visualExplanation}</span>
        </div>
        {props.shortFormReason ? (
          <div className="flex items-start justify-between gap-3">
            <span>Post format</span>
            <span className="max-w-[68%] text-right">{props.shortFormReason}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5" />Visual strength</span>
          <span>{props.visualStrength}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" />Repost safety</span>
          <span>{props.repostSafety}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/topics/${props.id}`} className="inline-flex items-center gap-2">
            {props.ctaLabel ?? "Use now"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={`/topics/${props.id}`}>
          <Bookmark className="mr-2 h-4 w-4" />
          Generate caption
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href={props.packetId ? `/packets/${props.packetId}` : `/topics/${props.id}`}>Create full post pack</Link>
        </Button>
      </div>
    </Card>
  );
}
