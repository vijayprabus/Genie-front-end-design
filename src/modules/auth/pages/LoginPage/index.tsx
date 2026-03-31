import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/modules/auth/components/AuthLayout.tsx";
import { LoginForm } from "./LoginForm.tsx";
import { Card, CardContent } from "@/shared/components/ui/card.tsx";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Genie Forge account">
      <Card>
        <CardContent className="pt-6">
          <LoginForm onSuccess={() => navigate("/chat")} />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
