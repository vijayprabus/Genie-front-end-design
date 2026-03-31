import { Store, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card.tsx";
import { Input } from "@/shared/components/ui/input.tsx";
import { Button } from "@/shared/components/ui/button.tsx";

const PLACEHOLDER_ITEMS = [
  { id: "1", name: "Data Analyzer Agent", description: "Analyze datasets with natural language queries", category: "Data" },
  { id: "2", name: "Code Review Agent", description: "Automated code review with best practices", category: "Development" },
  { id: "3", name: "Content Writer Agent", description: "Generate high-quality content from prompts", category: "Content" },
  { id: "4", name: "Research Agent", description: "Deep research across multiple sources", category: "Research" },
];

export default function MarketplaceBrowsePage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Marketplace</h1>
        <div className="relative w-full md:w-72">
          <label htmlFor="marketplace-search" className="sr-only">Search marketplace</label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="marketplace-search" placeholder="Search agents..." className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Store className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{item.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
