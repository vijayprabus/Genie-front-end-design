import { Bot } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card.tsx";
import { Button } from "@/shared/components/ui/button.tsx";

export default function MarketplaceAgentsPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="max-w-md text-center" size="lg">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="rounded-full bg-primary/10 p-4">
            <Bot className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">My Agents</h1>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added any agents yet. Browse the marketplace to get started.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/marketplace/browse">Browse Marketplace</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
