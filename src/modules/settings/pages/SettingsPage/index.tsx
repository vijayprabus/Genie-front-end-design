import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card.tsx";
import { Button } from "@/shared/components/ui/button.tsx";
import { Separator } from "@/shared/components/ui/separator.tsx";
import { useAuthStore } from "@/modules/auth/store/authStore.ts";
import { useThemeStore } from "@/modules/settings/store/themeStore.ts";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium text-foreground">{user?.name || "N/A"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user?.email || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize how Genie Forge looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Currently using {theme} mode
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === "light" ? "dark" : "light"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
