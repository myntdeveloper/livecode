import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Code2, Moon, Sun, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SpotlightCard } from "../components/SpotlightCard";
import { SpotlightBackground } from "../components/SpotlightBackground";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { isAuthenticated } from "../utils/auth";
import { createRoom as createRoomRequest } from "../api/room";

export function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [roomId, setRoomId] = useState("");
  const [userDisplay, setUserDisplay] = useState("U");
  const [avatarUrl, setAvatarUrl] = useState("");
  const authenticated = isAuthenticated();

  useEffect(() => {
    const firstName = localStorage.getItem("userFirstName");
    const lastName = localStorage.getItem("userLastName");
    const username = localStorage.getItem("userName");
    const savedAvatarUrl = localStorage.getItem("userAvatarUrl") || "";

    if (firstName && lastName) {
      setUserDisplay(`${firstName[0]}${lastName[0]}`.toUpperCase());
    } else if (username) {
      setUserDisplay(username[0].toUpperCase());
    }
    setAvatarUrl(savedAvatarUrl);
  }, []);

  const createRoom = async () => {
    if (!authenticated) {
      navigate("/auth");
      return;
    }

    try {
      const room = await createRoomRequest();
      navigate(`/room/${room.id}`);
    } catch {
      navigate("/auth");
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      const cleanId = roomId.includes("/room/")
        ? roomId.split("/room/")[1]
        : roomId;
      navigate(`/room/${cleanId}`);
    }
  };

  return (
    <SpotlightBackground className="min-h-screen bg-background text-foreground select-none">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 backdrop-blur-sm bg-background/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl tracking-tight font-semibold">
              Livecode
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as "en" | "ru")
              }
              className="w-28 h-9 text-sm font-medium bg-muted/50 border-border/50"
            >
              <option value="en">{t("language.english")}</option>
              <option value="ru">{t("language.russian")}</option>
            </Select>
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {authenticated ? (
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all"
                title={t("landing.profile")}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="GitHub avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {userDisplay}
                  </div>
                )}
              </button>
            ) : (
              <Button
                className="h-9"
                onClick={() => navigate("/auth")}
              >
                {t("auth.loginButton")}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 animate-pulse" />
                <Code2 className="w-4 h-4 relative z-10" />
              </div>
              <span>{t("hero.badge")}</span>
            </div>
            <h1 className="text-5xl md:text-7xl tracking-tight font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={createRoom}
              size="lg"
              className="min-w-48"
            >
              {t("button.createRoom")}
            </Button>
          </div>

          {/* Join Section */}
          <div className="max-w-md mx-auto mt-12 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("input.roomPlaceholder")}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && joinRoom()
                }
                className="flex-1"
              />
              <Button
                onClick={joinRoom}
                variant="secondary"
                className="px-8"
              >
                {t("button.join")}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-24">
            <SpotlightCard>
              <div className="p-8 rounded-lg bg-card border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 fill-primary text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  {t("feature.realtime")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("feature.realtimeDesc")}
                </p>
              </div>
            </SpotlightCard>
            <SpotlightCard>
              <div className="p-8 rounded-lg bg-card border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  {t("feature.cursors")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("feature.cursorsDesc")}
                </p>
              </div>
            </SpotlightCard>
            <SpotlightCard>
              <div className="p-8 rounded-lg bg-card border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  {t("feature.languages")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("feature.languagesDesc")}
                </p>
              </div>
            </SpotlightCard>
            <SpotlightCard>
              <div className="p-8 rounded-lg bg-card border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  {t("feature.sandbox")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("feature.sandboxDesc")}
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8 mt-24">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>{t("footer.text")}</p>
        </div>
      </footer>

    </SpotlightBackground>
  );
}