import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card className="bg-card/90 card-raise">
      <CardDescription className="text-xs uppercase tracking-[0.16em]">{label}</CardDescription>
      <CardTitle className="mt-3 text-3xl">{value}</CardTitle>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </Card>
  );
}
