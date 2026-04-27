import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Github, Code2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useLanguage } from "../context/LanguageContext";
import { loginGithub } from "../api/auth";
import { markAuthenticated } from "../utils/auth";

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [loadingProvider, setLoadingProvider] = useState<"github" | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/";

  useEffect(() => {
    const login = searchParams.get("login");
    const avatarUrl = searchParams.get("avatar_url");

    if (!login) {
      return;
    }

    markAuthenticated("github");
    localStorage.setItem("userName", login);
    if (avatarUrl) {
      localStorage.setItem("userAvatarUrl", avatarUrl);
    }
    navigate(redirectTo, { replace: true });
  }, [searchParams, navigate, redirectTo]);

  const handleLogin = () => {
    setLoadingProvider("github");
    loginGithub();
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <section className="w-full max-w-md mx-auto rounded-2xl border border-border bg-card shadow-md">
        <div className="flex flex-col items-center justify-center px-8 py-10">
          <div className="flex flex-col items-center gap-4 w-full mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Livecode</span>
            </div>
            <h2 className="text-xl font-medium leading-tight text-center">
              {t("auth.welcomeTitle")}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.welcomeSubtitle")}
            </p>
          </div>
          <div className="w-full mt-2">
            <Button
              className="w-full h-10 text-sm font-medium"
              onClick={handleLogin}
              disabled={loadingProvider !== null}
            >
              <Github className="w-4 h-4 mr-2" />
              {loadingProvider === "github"
                ? t("auth.loading")
                : t("auth.github")}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
