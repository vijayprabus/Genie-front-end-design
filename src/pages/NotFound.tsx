import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button.tsx";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <Button asChild variant="outline" size="sm">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
