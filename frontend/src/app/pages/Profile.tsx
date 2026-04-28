import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useLanguage } from "../context/LanguageContext";
import { logout } from "../utils/auth";
import { logoutRequest } from "../api/auth";
import { getProfile, updateProfileName } from "../api/user";

export function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const user = response.user;

        setFirstName(user.name || "");
        setLastName(user.surname || "");
        setUsername(user.login || "User");
        setAvatarUrl(user.avatar_url || "");

        localStorage.setItem("userFirstName", user.name || "");
        localStorage.setItem("userLastName", user.surname || "");
        localStorage.setItem("userName", user.login || "User");
        localStorage.setItem("userAvatarUrl", user.avatar_url || "");
      } catch {
        const savedFirstName = localStorage.getItem("userFirstName") || "";
        const savedLastName = localStorage.getItem("userLastName") || "";
        const savedUsername = localStorage.getItem("userName") || "User";
        const savedAvatarUrl = localStorage.getItem("userAvatarUrl") || "";

        setFirstName(savedFirstName);
        setLastName(savedLastName);
        setUsername(savedUsername);
        setAvatarUrl(savedAvatarUrl);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const response = await updateProfileName(firstName, lastName);
      localStorage.setItem("userFirstName", response.user.name || "");
      localStorage.setItem("userLastName", response.user.surname || "");
      navigate("/");
    } catch {
      localStorage.setItem("userFirstName", firstName);
      localStorage.setItem("userLastName", lastName);
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
    }
    logout();
    navigate("/auth");
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("profile.back")}</span>
          </button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t("profile.logout")}
          </Button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl mb-2">{t("profile.title")}</h1>
            <p className="text-muted-foreground">{t("profile.subtitle")}</p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="GitHub avatar"
                className="w-24 h-24 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {getInitials()}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("profile.avatarLocked")}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("profile.firstName")}</label>
                <Input
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("profile.lastName")}</label>
                <Input
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("profile.username")}</label>
              <Input
                placeholder="johndoe"
                value={username}
                disabled
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave}>{t("profile.saveChanges")}</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                {t("common.cancel")}
              </Button>
            </div>
            {isLoading && (
              <p className="text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
