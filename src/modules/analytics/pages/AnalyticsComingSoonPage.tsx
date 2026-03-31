import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card.tsx";

export default function AnalyticsComingSoonPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="max-w-md text-center" size="lg">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="rounded-full bg-primary/10 p-4">
            <BarChart3 className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Analytics Coming Soon</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;re building powerful analytics to help you understand your data better.
            Stay tuned for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
