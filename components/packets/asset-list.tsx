import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Asset = {
  title?: string | null;
  platform: string;
  content: string;
  type: string;
};

export function AssetList({ assets }: { assets: Asset[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {assets.map((asset, index) => (
        <Card key={`${asset.type}-${index}`}>
          <div className="mb-3 flex items-center justify-between">
            <Badge>{asset.platform}</Badge>
            <Badge>{asset.type}</Badge>
          </div>
          <CardTitle>{asset.title ?? asset.type}</CardTitle>
          <CardDescription className="mt-3 whitespace-pre-wrap">{asset.content}</CardDescription>
        </Card>
      ))}
    </div>
  );
}
