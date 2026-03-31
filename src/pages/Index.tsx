import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/modules/auth/store/authStore.ts";

export default function IndexPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    navigate(isAuthenticated ? "/chat" : "/login", { replace: true });
  }, [isAuthenticated, navigate]);

  return null;
}
